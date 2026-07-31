export function renderDashboardPage(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>D.I.A.S Dashboard</title>
<style>
:root { --teal: #0f766e; --teal-light: #ccfbf1; --bg: #f8fafc; --card: #ffffff; --border: #e2e8f0; --muted: #64748b; }
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Segoe UI', system-ui, sans-serif; background: var(--bg); color: #0f172a; }
header { background: var(--teal); color: #fff; padding: 1rem 1.5rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
header h1 { font-size: 1.25rem; }
.controls { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
.controls label { font-size: .85rem; display: flex; align-items: center; gap: .4rem; }
.controls input { padding: .35rem .5rem; border-radius: .35rem; border: 1px solid var(--border); font-size: .85rem; }
button { cursor: pointer; border: none; border-radius: .4rem; padding: .45rem .85rem; font-size: .85rem; background: var(--teal); color: #fff; }
button:hover { filter: brightness(1.08); }
button.ghost { background: transparent; border: 1px solid var(--border); color: var(--muted); }
.stats { display: flex; gap: 1rem; padding: .75rem 1.5rem; border-bottom: 1px solid var(--border); background: var(--card); }
.stat { font-size: .8rem; color: var(--muted); }
.stat b { color: #0f172a; }
.board { display: flex; gap: 1rem; padding: 1.25rem 1.5rem; overflow-x: auto; align-items: flex-start; }
.column { background: #f1f5f9; border-radius: .6rem; padding: .65rem; min-width: 215px; flex-shrink: 0; }
.column h3 { font-size: .78rem; text-transform: uppercase; letter-spacing: .04em; color: var(--muted); margin-bottom: .6rem; display: flex; justify-content: space-between; }
.column h3 span { background: #e2e8f0; border-radius: 999px; padding: 0 .5rem; }
.card { background: var(--card); border: 1px solid var(--border); border-radius: .5rem; padding: .75rem; margin-bottom: .6rem; box-shadow: 0 1px 2px rgba(0,0,0,.04); }
.card h4 { font-size: .9rem; margin-bottom: .3rem; }
.card .meta { font-size: .75rem; color: var(--muted); margin-bottom: .35rem; }
.badge { display: inline-block; font-size: .68rem; border-radius: 999px; padding: .1rem .5rem; background: #fef3c7; color: #92400e; margin-right: .3rem; }
.badge.outdated { background: #fee2e2; color: #991b1b; }
.badge.ok { background: #dcfce7; color: #166534; }
.tech { font-size: .7rem; color: var(--muted); margin: .35rem 0; }
.card .actions { display: flex; gap: .4rem; margin-top: .55rem; flex-wrap: wrap; }
.card .actions a { font-size: .78rem; color: var(--teal); text-decoration: none; border: 1px solid var(--border); padding: .25rem .55rem; border-radius: .35rem; }
.draft { font-size: .74rem; background: #f8fafc; border: 1px dashed var(--border); padding: .5rem; border-radius: .4rem; margin-top: .5rem; max-height: 90px; overflow: auto; white-space: pre-wrap; color: #334155; }
.empty { font-size: .75rem; color: var(--muted); font-style: italic; padding: .5rem 0; }
.toast { position: fixed; bottom: 1rem; right: 1rem; background: #0f172a; color: #fff; padding: .7rem 1rem; border-radius: .5rem; font-size: .85rem; opacity: 0; transition: opacity .25s; pointer-events: none; }
.toast.show { opacity: 1; }
</style>
</head>
<body>
<header>
  <h1>D.I.A.S — Pipeline Control</h1>
  <div class="controls">
    <label>Mode:
      <select id="mode">
        <option value="full">Full pipeline</option>
        <option value="stage">Individual stage</option>
      </select>
    </label>
    <label>Industry <input id="industry" placeholder="restaurants" /></label>
    <label>Region <input id="region" placeholder="Lisbon" /></label>
    <label>Limit <input id="limit" type="number" value="50" style="width:70px" /></label>
    <button id="runBtn">Run</button>
  </div>
</header>
<div class="stats" id="stats"></div>
<div class="board" id="board"></div>
<div class="toast" id="toast"></div>
<script>
const STATES = ['DISCOVERED','ENRICHED','QUALIFIED','SITE_DRAFT_BUILDING','SITE_DRAFT_READY','PROPOSAL_DRAFTED','PROPOSAL_APPROVED','PROPOSAL_SENT','RESPONDED','WON','LOST','STALE'];
let state = null;

async function api(path, opts) {
  const res = await fetch(path, opts);
  if (!res.ok) throw new Error((await res.json()).error || res.statusText);
  return res.json();
}

function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 2500);
}

function esc(s) { return String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])); }

async function refresh() {
  try {
    state = await api('/api/cases');
  } catch (e) { toast('Error loading: ' + e.message); return; }

  const stats = document.getElementById('stats');
  const draftCount = state.canApprove;
  stats.innerHTML = '<span class="stat">Total cases: <b>' + state.total + '</b></span>'
    + '<span class="stat">Awaiting approval: <b>' + draftCount + '</b></span>'
    + '<span class="stat">Sent: <b>' + (state.columns.PROPOSAL_SENT ? state.columns.PROPOSAL_SENT.length : 0) + '</b></span>'
    + '<span class="stat">Won: <b>' + (state.columns.WON ? state.columns.WON.length : 0) + '</b></span>';

  const board = document.getElementById('board');
  board.innerHTML = '';
  for (const s of STATES) {
    const cards = state.columns[s] || [];
    const col = document.createElement('div');
    col.className = 'column';
    const title = document.createElement('h3');
    title.innerHTML = s + ' <span>' + cards.length + '</span>';
    col.appendChild(title);
    if (cards.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty';
      empty.textContent = 'No cases';
      col.appendChild(empty);
    } else {
      for (const c of cards) col.appendChild(cardEl(c));
    }
    board.appendChild(col);
  }
}

function cardEl(c) {
  const card = document.createElement('div');
  card.className = 'card';
  let html = '<h4>' + esc(c.companyName) + '</h4>';
  html += '<div class="meta">' + [c.industry, c.region].filter(Boolean).map(esc).join(' · ') + '</div>';
  if (c.website) html += '<div class="meta">' + esc(c.website) + '</div>';
  html += c.siteOutdated ? '<span class="badge outdated">outdated</span>' : '<span class="badge ok">modern</span>';
  if (c.techStack && c.techStack.length) html += '<div class="tech">Tech: ' + esc(c.techStack.join(', ')) + '</div>';
  const actions = [];
  if (c.previewUrl) actions.push('<a href="' + esc(c.previewUrl) + '" target="_blank">Preview site</a>');
  if (c.currentState === 'PROPOSAL_DRAFTED') {
    actions.push('<button data-approve="' + esc(c.id) + '">Approve</button>');
  }
  if (actions.length) html += '<div class="actions">' + actions.join('') + '</div>';
  if (c.draftContent) html += '<div class="draft">' + esc(c.draftContent) + '</div>';
  card.innerHTML = html;
  const approveBtn = card.querySelector('[data-approve]');
  if (approveBtn) approveBtn.addEventListener('click', () => approve(c.id, approveBtn));
  return card;
}

async function approve(id, btn) {
  btn.disabled = true;
  try {
    await api('/api/cases/' + encodeURIComponent(id) + '/approve', { method: 'POST' });
    toast('Approved ' + id.slice(0, 8) + '...');
  } catch (e) { toast('Error: ' + e.message); }
  refresh();
}

async function run() {
  const mode = document.getElementById('mode').value;
  const params = {
    industry: document.getElementById('industry').value || undefined,
    region: document.getElementById('region').value || undefined,
    limit: Number(document.getElementById('limit').value) || 50,
  };
  const btn = document.getElementById('runBtn');
  btn.disabled = true; btn.textContent = 'Running...';
  try {
    const result = await api('/api/run' + (mode === 'stage' ? '?mode=stage' : ''), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    toast('Run complete: ' + result.sent + ' sent, ' + result.failed + ' failed');
  } catch (e) { toast('Error: ' + e.message); }
  btn.disabled = false; btn.textContent = 'Run';
  refresh();
}

document.getElementById('runBtn').addEventListener('click', run);
refresh();
setInterval(refresh, 4000);
</script>
</body>
</html>`;
}
