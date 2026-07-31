export function renderDashboardPage(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>D.I.A.S — Pipeline Dashboard</title>
<style>
:root {
  --bg: #0f172a;
  --bg-soft: #1e293b;
  --panel: #ffffff;
  --panel-dark: #111827;
  --ink: #0f172a;
  --muted: #94a3b8;
  --border: #e2e8f0;
  --border-dark: #334155;
  --accent: #14b8a6;
  --radius: 14px;
  --shadow: 0 1px 3px rgba(15, 23, 42, .06), 0 8px 24px rgba(15, 23, 42, .08);
  --font: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
}
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: var(--font);
  background: #f1f5f9;
  color: var(--ink);
  min-height: 100vh;
}
button { font-family: inherit; cursor: pointer; border: none; }
a { text-decoration: none; color: inherit; }

/* ---------- Header ---------- */
.topbar {
  position: sticky; top: 0; z-index: 20;
  background: linear-gradient(135deg, #0f172a 0%, #134e4a 100%);
  color: #fff; padding: .9rem 1.75rem;
  display: flex; align-items: center; gap: 1.25rem;
  box-shadow: 0 2px 12px rgba(15, 23, 42, .25);
}
.brand { display: flex; align-items: center; gap: .7rem; }
.brand .logo {
  width: 34px; height: 34px; border-radius: 10px;
  background: linear-gradient(135deg, #2dd4bf, #0ea5e9);
  display: grid; place-items: center;
  font-weight: 800; font-size: .85rem; color: #fff;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,.25);
}
.brand h1 { font-size: 1.05rem; letter-spacing: .01em; }
.brand .tag { display: block; font-size: .65rem; font-weight: 500; color: #99f6e4; opacity: .85; margin-top: .1rem; }
.topbar .spacer { flex: 1; }
.mode-switch {
  display: flex; background: rgba(255,255,255,.1); border-radius: 999px; padding: .2rem; gap: .15rem;
}
.mode-switch button {
  background: transparent; color: #cbd5e1; font-size: .75rem; font-weight: 600;
  padding: .4rem .9rem; border-radius: 999px; transition: all .15s;
}
.mode-switch button.active { background: #fff; color: #0f172a; }
.primary-btn {
  background: linear-gradient(135deg, #2dd4bf, #14b8a6);
  color: #fff; font-weight: 700; font-size: .8rem;
  padding: .55rem 1.1rem; border-radius: 10px;
  box-shadow: 0 4px 14px rgba(20, 184, 166, .35);
  transition: transform .12s, box-shadow .12s;
}
.primary-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(20, 184, 166, .45); }
.primary-btn:disabled { opacity: .6; cursor: not-allowed; transform: none; }

/* ---------- KPI row ---------- */
.kpis {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: .9rem; padding: 1.25rem 1.75rem .25rem;
}
.kpi {
  background: var(--panel); border-radius: var(--radius);
  padding: .9rem 1.1rem; box-shadow: var(--shadow);
  border: 1px solid var(--border);
  display: flex; flex-direction: column; gap: .25rem;
}
.kpi .label { font-size: .68rem; font-weight: 700; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); }
.kpi .value { font-size: 1.5rem; font-weight: 800; line-height: 1.1; }
.kpi .dot { display: inline-block; width: 9px; height: 9px; border-radius: 50%; margin-right: .35rem; }
.kpi.total .value { color: #0ea5e9; }
.kpi.qualified .value { color: #8b5cf6; }
.kpi.approve .value { color: #f59e0b; }
.kpi.sent .value { color: #06b6d4; }
.kpi.won .value { color: #10b981; }

/* ---------- Toolbar ---------- */
.toolbar {
  display: flex; align-items: center; gap: .8rem;
  padding: 1rem 1.75rem .5rem; flex-wrap: wrap;
}
.view-switch { display: flex; background: #e2e8f0; border-radius: 10px; padding: .2rem; gap: .15rem; }
.view-switch button { background: transparent; color: #475569; font-size: .75rem; font-weight: 600; padding: .4rem .85rem; border-radius: 8px; }
.view-switch button.active { background: #fff; color: #0f172a; box-shadow: 0 1px 3px rgba(15,23,42,.15); }
.search {
  display: flex; align-items: center; gap: .5rem; background: #fff;
  border: 1px solid var(--border); border-radius: 10px; padding: .45rem .8rem; min-width: 240px;
}
.search svg { color: var(--muted); flex-shrink: 0; }
.search input { border: none; outline: none; font-size: .82rem; width: 100%; background: transparent; }
.toolbar .spacer { flex: 1; }
.filter-chips { display: flex; gap: .4rem; flex-wrap: wrap; }
.chip {
  font-size: .72rem; font-weight: 600; padding: .3rem .7rem; border-radius: 999px;
  background: #e2e8f0; color: #475569; transition: all .12s;
}
.chip.active { background: var(--ink); color: #fff; }
.chip:hover { filter: brightness(.96); }

/* ---------- Board ---------- */
.board {
  display: grid; grid-template-columns: repeat(6, minmax(250px, 1fr));
  gap: 1rem; padding: .75rem 1.75rem 2.5rem; overflow-x: auto;
  align-items: start;
}
@media (max-width: 1500px) { .board { grid-template-columns: repeat(3, minmax(260px, 1fr)); } }
@media (max-width: 900px) { .board { grid-template-columns: repeat(2, minmax(260px, 1fr)); } }
@media (max-width: 560px) { .board { grid-template-columns: 1fr; } }
.column {
  background: #e9eef5; border-radius: var(--radius);
  padding: .7rem; min-height: 140px;
  border: 1px solid #dbe3ee;
}
.column .col-head { display: flex; align-items: center; gap: .5rem; padding: .25rem .25rem .65rem; }
.column .col-head .dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.column .col-head h3 { font-size: .8rem; font-weight: 700; letter-spacing: .02em; }
.column .col-head .count {
  margin-left: auto; font-size: .7rem; font-weight: 700; color: var(--muted);
  background: #fff; border: 1px solid var(--border); border-radius: 999px; padding: .1rem .55rem;
}
.column .col-desc { font-size: .68rem; color: var(--muted); padding: 0 .25rem .6rem; }
.column .empty { font-size: .72rem; color: var(--muted); font-style: italic; padding: .6rem .25rem; text-align: center; }

.card {
  background: #fff; border-radius: 12px; padding: .8rem;
  margin-bottom: .65rem; box-shadow: 0 1px 2px rgba(15,23,42,.06);
  border-left: 3px solid var(--stage, #94a3b8);
  transition: transform .12s, box-shadow .12s;
  position: relative;
}
.card:hover { transform: translateY(-2px); box-shadow: 0 6px 18px rgba(15,23,42,.12); }
.card .row { display: flex; align-items: center; gap: .6rem; }
.avatar {
  width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0;
  display: grid; place-items: center; font-weight: 800; font-size: .8rem; color: #fff;
  background: var(--stage, #94a3b8);
}
.card h4 { font-size: .86rem; font-weight: 700; line-height: 1.25; }
.card .sub { font-size: .72rem; color: var(--muted); }
.pill {
  display: inline-flex; align-items: center; gap: .3rem;
  font-size: .66rem; font-weight: 700; border-radius: 999px;
  padding: .18rem .6rem; margin-top: .5rem;
}
.pill .pdot { width: 6px; height: 6px; border-radius: 50%; }
.pill.outdated { background: #fef2f2; color: #b91c1c; }
.pill.outdated .pdot { background: #ef4444; }
.pill.modern { background: #ecfdf5; color: #047857; }
.pill.modern .pdot { background: #10b981; }
.progress { height: 5px; border-radius: 999px; background: #e2e8f0; margin-top: .6rem; overflow: hidden; }
.progress span { display: block; height: 100%; border-radius: 999px; background: var(--stage, #94a3b8); transition: width .4s ease; }
.tech { font-size: .68rem; color: var(--muted); margin-top: .45rem; display: flex; flex-wrap: wrap; gap: .25rem; }
.tech i { font-style: normal; background: #f1f5f9; border: 1px solid var(--border); padding: .05rem .4rem; border-radius: 5px; }
.actions { display: flex; gap: .4rem; margin-top: .65rem; flex-wrap: wrap; }
.action {
  font-size: .7rem; font-weight: 700; padding: .34rem .7rem; border-radius: 8px;
  transition: filter .12s;
}
.action.primary { background: var(--stage, #0f172a); color: #fff; }
.action.ghost { background: #f1f5f9; color: #334155; border: 1px solid var(--border); }
.action.success { background: #10b981; color: #fff; }
.action.danger { background: #ef4444; color: #fff; }
.action:hover { filter: brightness(.92); }
.action:disabled { opacity: .5; cursor: not-allowed; }
.card .links { display: flex; gap: .6rem; margin-top: .55rem; flex-wrap: wrap; }
.card .links a { font-size: .7rem; font-weight: 600; color: #0d9488; }
.card .links a:hover { text-decoration: underline; }
.draft {
  font-size: .72rem; background: #f8fafc; border: 1px dashed #cbd5e1;
  padding: .55rem; border-radius: 8px; margin-top: .6rem;
  max-height: 100px; overflow: auto; white-space: pre-wrap; color: #334155;
}
.draft summary { cursor: pointer; font-weight: 700; color: #475569; font-size: .7rem; }
.sent-meta { font-size: .66rem; color: var(--muted); margin-top: .5rem; }

/* ---------- Drag & drop ---------- */
.card.dragging { opacity: .45; transform: rotate(2deg) scale(.98); box-shadow: 0 10px 30px rgba(15,23,42,.25); }
.column.drag-over { outline: 2px dashed #0d9488; outline-offset: -4px; background: #e6f7f5; }
.card { cursor: grab; }
.card:active { cursor: grabbing; }

/* ---------- Variant picker ---------- */
.variant-list { max-height: 260px; overflow: auto; display: flex; flex-direction: column; gap: .5rem; margin-top: .4rem; }
.variant-item {
  display: flex; gap: .6rem; align-items: flex-start; padding: .65rem;
  border: 1px solid var(--border); border-radius: 10px; cursor: pointer; transition: all .12s;
}
.variant-item:hover { border-color: #0d9488; background: #f0fdfa; }
.variant-item.selected { border-color: #0d9488; background: #f0fdfa; box-shadow: 0 0 0 3px rgba(13,148,136,.12); }
.variant-item input { margin-top: .15rem; accent-color: #0d9488; }
.variant-item .v-label { font-size: .62rem; font-weight: 700; color: #0d9488; text-transform: uppercase; letter-spacing: .05em; }
.variant-item .v-body { font-size: .78rem; color: #334155; white-space: pre-wrap; margin-top: .15rem; }
.variant-meta { font-size: .7rem; color: var(--muted); margin-top: .4rem; }
.variant-spinner { text-align: center; color: var(--muted); font-size: .8rem; padding: 1rem; }

/* ---------- List view ---------- */
.table-wrap { padding: .5rem 1.75rem 2.5rem; display: none; }
.table-wrap.show { display: block; }
table { width: 100%; border-collapse: collapse; background: #fff; border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow); border: 1px solid var(--border); }
thead th { font-size: .68rem; text-transform: uppercase; letter-spacing: .05em; color: var(--muted); text-align: left; padding: .8rem 1rem; background: #f8fafc; border-bottom: 1px solid var(--border); }
tbody td { padding: .7rem 1rem; font-size: .8rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
tbody tr:hover { background: #f8fafc; }
tbody tr:last-child td { border-bottom: none; }
.state-tag { font-size: .68rem; font-weight: 700; padding: .2rem .6rem; border-radius: 999px; color: #fff; }
.mono { font-family: ui-monospace, 'Cascadia Mono', monospace; font-size: .72rem; color: var(--muted); }

/* ---------- Modal ---------- */
.modal-backdrop {
  position: fixed; inset: 0; background: rgba(15,23,42,.55); backdrop-filter: blur(3px);
  display: none; align-items: center; justify-content: center; z-index: 50; padding: 1rem;
}
.modal-backdrop.show { display: flex; }
.modal {
  background: #fff; border-radius: 18px; width: 100%; max-width: 430px;
  padding: 1.5rem; box-shadow: 0 20px 60px rgba(15,23,42,.35);
}
.modal h2 { font-size: 1.05rem; margin-bottom: .25rem; }
.modal .hint { font-size: .75rem; color: var(--muted); margin-bottom: 1rem; }
.field { margin-bottom: .85rem; }
.field label { display: block; font-size: .72rem; font-weight: 700; color: #475569; margin-bottom: .35rem; text-transform: uppercase; letter-spacing: .04em; }
.field input, .field select {
  width: 100%; padding: .6rem .75rem; border: 1px solid var(--border);
  border-radius: 10px; font-size: .85rem; outline: none; font-family: inherit;
}
.field input:focus, .field select:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(20,184,166,.15); }
.modal .form-actions { display: flex; gap: .6rem; margin-top: 1.1rem; justify-content: flex-end; }
.btn-ghost { background: #f1f5f9; color: #334155; font-weight: 600; font-size: .8rem; padding: .55rem 1rem; border-radius: 10px; }

/* ---------- Toast ---------- */
.toast {
  position: fixed; bottom: 1.25rem; right: 1.25rem; z-index: 60;
  background: #0f172a; color: #fff; padding: .75rem 1.1rem; border-radius: 12px;
  font-size: .82rem; box-shadow: 0 10px 30px rgba(15,23,42,.35);
  opacity: 0; transform: translateY(10px); transition: all .25s; pointer-events: none;
  max-width: 360px;
}
.toast.show { opacity: 1; transform: translateY(0); }
.toast.error { background: #991b1b; }
</style>
</head>
<body>

<header class="topbar">
  <div class="brand">
    <div class="logo">D</div>
    <div>
      <h1>D.I.A.S</h1>
      <span class="tag">Lead Generation Pipeline</span>
    </div>
  </div>
  <div class="spacer"></div>
  <div class="mode-switch" id="modeSwitch">
    <button data-mode="full" class="active">Full pipeline</button>
    <button data-mode="stage">Individual stage</button>
  </div>
  <button class="primary-btn" id="runBtn">
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style="vertical-align:-2px;margin-right:.35rem"><path d="M8 5v14l11-7z"/></svg>
    Run pipeline
  </button>
</header>

<section class="kpis" id="kpis"></section>

<div class="toolbar">
  <div class="view-switch" id="viewSwitch">
    <button data-view="board" class="active">Board</button>
    <button data-view="list">List</button>
  </div>
  <div class="search">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
    <input id="searchInput" placeholder="Search companies..." />
  </div>
  <div class="spacer"></div>
  <div class="filter-chips" id="chips"></div>
</div>

<div class="board" id="board"></div>

<div class="table-wrap" id="tableWrap">
  <table>
    <thead><tr>
      <th>Company</th><th>State</th><th>Stage</th><th>Industry</th><th>Region</th><th>Tech</th><th>Progress</th><th>Actions</th>
    </tr></thead>
    <tbody id="tableBody"></tbody>
  </table>
</div>

<div class="modal-backdrop" id="modalBackdrop">
  <div class="modal">
    <h2>Run pipeline</h2>
    <p class="hint" id="modalHint">Discover companies, build sites, draft and send proposals.</p>
    <div class="field"><label>Industry</label><input id="fIndustry" placeholder="e.g. restaurants" /></div>
    <div class="field"><label>Region</label><input id="fRegion" placeholder="e.g. Lisbon" /></div>
    <div class="field"><label>Keywords</label><input id="fKeywords" placeholder="optional" /></div>
    <div class="field"><label>Limit</label><input id="fLimit" type="number" value="50" /></div>
    <div class="field"><label>Site tier</label>
      <select id="fTier"><option value="simple">Simple</option><option value="complex">Complex</option></select>
    </div>
    <div class="form-actions">
      <button class="btn-ghost" id="cancelRun">Cancel</button>
      <button class="primary-btn" id="confirmRun">Start</button>
    </div>
  </div>
</div>

<div class="modal-backdrop" id="siteModalBackdrop">
  <div class="modal">
    <h2 id="siteModalTitle">Build website</h2>
    <p class="hint">Choose a design theme and tier for this lead's site.</p>
    <div class="field"><label>Theme</label><select id="fTheme"></select></div>
    <div class="field"><label>Site tier</label>
      <select id="fSiteTier"><option value="simple">Simple (1 page)</option><option value="complex">Complex (5 pages)</option></select>
    </div>
    <div class="form-actions">
      <button class="btn-ghost" id="cancelSite">Cancel</button>
      <button class="primary-btn" id="confirmSite">Build</button>
    </div>
  </div>
</div>

<div class="modal-backdrop" id="variantModalBackdrop">
  <div class="modal">
    <h2>Choose proposal draft</h2>
    <p class="hint">Pick the email/SMS variant you want to send for this lead.</p>
    <div class="field"><label>Channel</label>
      <select id="vChannel">
        <option value="email">Email</option>
        <option value="sms">SMS</option>
      </select>
    </div>
    <div class="variant-list" id="variantList"><div class="variant-spinner">Generating variants...</div></div>
    <div class="form-actions">
      <button class="btn-ghost" id="cancelVariant">Cancel</button>
      <button class="primary-btn" id="confirmVariant">Use this draft</button>
    </div>
  </div>
</div>

<div class="toast" id="toast"></div>

<script>
const $ = (s) => document.querySelector(s);
const STAGES = [
  { id: 'discovery', label: 'Discovery', color: '#3b82f6' },
  { id: 'building', label: 'Building', color: '#8b5cf6' },
  { id: 'proposal', label: 'Proposal', color: '#f59e0b' },
  { id: 'outreach', label: 'Outreach', color: '#06b6d4' },
  { id: 'followup', label: 'Follow-up', color: '#14b8a6' },
  { id: 'closed', label: 'Closed', color: '#64748b' },
];
const ACTION_LABELS = { build: 'Build site', draft: 'Draft', approve: 'Approve', send: 'Send', win: 'Win', lose: 'Lose' };

let state = null;
let activeView = 'board';
let activeStage = null;
let searchTerm = '';
let mode = 'full';
let themes = [];
let activeCase = null;
let variantCaseId = null;
let variantIndex = 0;

async function api(path, opts) {
  const res = await fetch(path, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}
function esc(s) { return String(s ?? '').replace(/[&<>"]/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c])); }
let toastTimer;
function toast(msg, error = false) {
  const el = $('#toast');
  el.textContent = msg;
  el.className = 'toast show' + (error ? ' error' : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 3000);
}

async function refresh() {
  try { state = await api('/api/cases'); }
  catch (e) { toast('Failed to load cases: ' + e.message, true); return; }
  renderKpis();
  renderChips();
  if (activeView === 'board') renderBoard(); else renderList();
}

function renderKpis() {
  const t = state.totals;
  $('#kpis').innerHTML = [
    kpi('total', 'Total leads', t.total, '#0ea5e9'),
    kpi('qualified', 'Discovery', t.discovery, '#8b5cf6'),
    kpi('approve', 'Proposal queue', t.proposal, '#f59e0b', t.canApprove + ' to approve'),
    kpi('sent', 'Sent', t.outreach, '#06b6d4'),
    kpi('won', 'Won', t.won, '#10b981', t.total ? Math.round(t.won / t.total * 100) + '% conv' : '0%'),
  ].join('');
}
function kpi(cls, label, value, color, sub) {
  return '<div class="kpi ' + cls + '"><span class="label"><span class="dot" style="background:' + color + '"></span>' + label + '</span>'
    + '<span class="value">' + value + '</span>' + (sub ? '<span class="sub" style="font-size:.7rem;color:var(--muted)">' + sub + '</span>' : '') + '</div>';
}

function renderChips() {
  const wrap = $('#chips');
  wrap.innerHTML = '<button class="chip' + (activeStage === null ? ' active' : '') + '" data-stage="">All</button>'
    + STAGES.map(s => '<button class="chip' + (activeStage === s.id ? ' active' : '') + '" data-stage="' + s.id + '">' + s.label + '</button>').join('');
  wrap.querySelectorAll('.chip').forEach(b => b.addEventListener('click', () => { activeStage = b.dataset.stage; refresh(); }));
}

function filteredCases() {
  let out = [];
  for (const col of state.stages) out = out.concat(col.cases);
  if (activeStage) out = out.filter(c => c.stage === activeStage);
  if (searchTerm) { const q = searchTerm.toLowerCase(); out = out.filter(c => (c.companyName + ' ' + (c.industry||'') + ' ' + (c.region||'')).toLowerCase().includes(q)); }
  return out;
}

function renderBoard() {
  const board = $('#board');
  board.innerHTML = '';
  for (const col of state.stages) {
    const el = document.createElement('div');
    el.className = 'column';
    el.dataset.stage = col.stage.id;
    el.innerHTML = '<div class="col-head"><span class="dot" style="background:' + col.stage.color + '"></span>'
      + '<h3>' + col.stage.label + '</h3><span class="count">' + col.count + '</span></div>'
      + '<div class="col-desc">' + col.stage.description + '</div>';
    if (col.cases.length === 0) {
      el.insertAdjacentHTML('beforeend', '<div class="empty">No cases here</div>');
    } else {
      for (const c of col.cases) el.appendChild(cardEl(c));
    }
    el.addEventListener('dragover', (e) => { e.preventDefault(); el.classList.add('drag-over'); });
    el.addEventListener('dragleave', () => el.classList.remove('drag-over'));
    el.addEventListener('drop', (e) => {
      e.preventDefault();
      el.classList.remove('drag-over');
      const id = e.dataTransfer.getData('text/plain');
      if (id && el.dataset.stage) moveCaseToStage(id, el.dataset.stage);
    });
    board.appendChild(el);
  }
}

function cardEl(c) {
  const card = document.createElement('div');
  card.className = 'card';
  card.draggable = true;
  card.style.setProperty('--stage', c.stageColor);
  card.addEventListener('dragstart', (e) => { e.dataTransfer.setData('text/plain', c.id); e.dataTransfer.effectAllowed = 'move'; card.classList.add('dragging'); });
  card.addEventListener('dragend', () => card.classList.remove('dragging'));
  const tags = c.siteOutdated
    ? '<span class="pill outdated"><span class="pdot"></span>Outdated</span>'
    : '<span class="pill modern"><span class="pdot"></span>Modern</span>';
  let html = '<div class="row">'
    + '<div class="avatar" style="background:' + c.stageColor + '">' + esc(c.initials || '?') + '</div>'
    + '<div><h4>' + esc(c.companyName) + '</h4><div class="sub">' + [c.industry, c.region].filter(Boolean).map(esc).join(' · ') + '</div></div>'
    + '</div>';
  html += '<div>' + tags + '</div>';
  if (c.techStack && c.techStack.length) html += '<div class="tech">' + c.techStack.map(t => '<i>' + esc(t) + '</i>').join('') + '</div>';
  html += '<div class="progress"><span style="width:' + c.progress + '%"></span></div>';
  html += '<div class="links">';
  if (c.website) html += '<a href="' + esc(c.website) + '" target="_blank" rel="noopener">Website</a>';
  if (c.previewUrl) html += '<a href="' + esc(c.previewUrl) + '" target="_blank" rel="noopener">Preview site</a>';
  html += '</div>';
  if (c.siteTheme || c.siteTier) html += '<div class="variant-meta">' + (c.siteTier ? 'Tier: <strong>' + esc(c.siteTier) + '</strong>' : '') + (c.siteTheme ? (c.siteTier ? ' · ' : '') + 'Theme: <strong>' + esc(c.siteTheme) + '</strong>' : '') + '</div>';
  const extraActions = [];
  if (c.currentState === 'SITE_DRAFT_READY') extraActions.push({ a: 'rebuild', label: 'Redesign' }, { a: 'variants', label: 'Draft options' });
  if (c.draftContent) html += '<details class="draft"><summary>' + (c.draftSubject ? 'View: ' + esc(c.draftSubject) : 'View proposal draft') + '</summary>' + esc(c.draftContent) + '</details>';
  if (c.sentAt) html += '<div class="sent-meta">Sent ' + esc(new Date(c.sentAt).toLocaleString()) + '</div>';
  const actions = c.actions.concat(extraActions);
  html += '<div class="actions">' + actions.map(a => actionBtn(c, a.a, a.label)).join('') + '</div>';
  card.innerHTML = html;
  card.querySelectorAll('[data-action]').forEach(b => b.addEventListener('click', () => performAction(c, b)));
  return card;
}

function actionBtn(c, a, customLabel) {
  const cls = a === 'win' ? 'success' : a === 'lose' ? 'danger' : a === 'approve' || a === 'send' ? 'primary' : 'ghost';
  const label = customLabel || ACTION_LABELS[a] || a;
  return '<button class="action ' + cls + '" data-action="' + a + '" data-id="' + esc(c.id) + '">' + label + '</button>';
}

async function moveCaseToStage(id, targetStage) {
  try {
    const r = await api('/api/cases/' + encodeURIComponent(id) + '/advance', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stage: targetStage }) });
    toast('Moved to ' + targetStage + ' → ' + r.currentState.replace(/_/g, ' ').toLowerCase());
  } catch (e) { toast('Error: ' + e.message, true); }
  refresh();
}

function renderList() {
  const tbody = $('#tableBody');
  const cases = filteredCases();
  tbody.innerHTML = cases.map(c => {
    const tags = c.siteOutdated ? 'Outdated' : 'Modern';
    return '<tr>'
      + '<td><strong>' + esc(c.companyName) + '</strong><div class="mono">' + esc(c.id.slice(0, 8)) + '</div></td>'
      + '<td><span class="state-tag" style="background:' + c.stageColor + '">' + esc(c.stateLabel) + '</span></td>'
      + '<td>' + esc(c.stage) + '</td>'
      + '<td>' + esc(c.industry || '—') + '</td>'
      + '<td>' + esc(c.region || '—') + '</td>'
      + '<td class="mono">' + esc((c.techStack || []).join(', ') || '—') + '</td>'
      + '<td><div class="progress" style="width:80px"><span style="width:' + c.progress + '%"></span></div></td>'
      + '<td><div class="actions" style="margin-top:0">' + c.actions.map(a => actionBtn(c, a)).join('') + '</div></td>'
      + '</tr>';
  }).join('') || '<tr><td colspan="8" style="text-align:center;color:var(--muted);padding:2rem">No cases match</td></tr>';
  tbody.querySelectorAll('[data-action]').forEach(b => b.addEventListener('click', () => performAction(null, b)));
}

async function performAction(c, btn) {
  const id = btn.dataset.id;
  const action = btn.dataset.action;

  if (action === 'build' || action === 'rebuild') {
    openSiteModal(c, action);
    return;
  }
  if (action === 'variants' || (action === 'draft' && c.currentState === 'SITE_DRAFT_READY')) {
    openVariantModal(c);
    return;
  }

  btn.disabled = true;
  try {
    const body = action === 'win' ? JSON.stringify({ dealValue: 1000 })
      : action === 'lose' ? JSON.stringify({ reason: 'lost' })
      : JSON.stringify({});
    const r = await api('/api/cases/' + encodeURIComponent(id) + '/' + action, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
    toast((ACTION_LABELS[action] || action) + ' → ' + r.currentState.replace(/_/g, ' ').toLowerCase());
  } catch (e) { toast('Error: ' + e.message, true); }
  refresh();
}

function openSiteModal(c, action) {
  activeCase = { c, action };
  $('#siteModalTitle').textContent = action === 'rebuild' ? 'Redesign website' : 'Build website';
  $('#confirmSite').textContent = action === 'rebuild' ? 'Redesign' : 'Build';
  $('#fTheme').innerHTML = themes.map(t => '<option value="' + esc(t.id) + '">' + esc(t.name) + '</option>').join('');
  $('#fTheme').value = c.siteTheme || '';
  $('#fSiteTier').value = c.siteTier === 'complex' ? 'complex' : 'simple';
  $('#siteModalBackdrop').classList.add('show');
}

async function confirmSiteBuild() {
  const { c, action } = activeCase;
  const body = JSON.stringify({ tier: $('#fSiteTier').value, theme: $('#fTheme').value });
  try {
    const r = await api('/api/cases/' + encodeURIComponent(c.id) + '/' + action, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body });
    toast((action === 'rebuild' ? 'Redesign' : 'Build') + ' → ' + r.currentState.replace(/_/g, ' ').toLowerCase());
    $('#siteModalBackdrop').classList.remove('show');
  } catch (e) { toast('Error: ' + e.message, true); }
  refresh();
}

function openVariantModal(c) {
  variantCaseId = c.id;
  variantIndex = 0;
  $('#variantList').innerHTML = '<div class="variant-spinner">Generating variants...</div>';
  $('#variantModalBackdrop').classList.add('show');
  generateVariants(c.id);
}

async function generateVariants(id) {
  const channel = $('#vChannel').value;
  try {
    const r = await api('/api/cases/' + encodeURIComponent(id) + '/draft-variants', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ channel, count: 3 }) });
    const list = $('#variantList');
    list.innerHTML = r.variants.map((v, i) => {
      const head = v.subject ? '<div class="v-label">' + esc(v.subject) + '</div>' : '';
      return '<label class="variant-item' + (i === 0 ? ' selected' : '') + '">'
        + '<input type="radio" name="variant" value="' + i + '"' + (i === 0 ? ' checked' : '') + '>'
        + '<div>' + head + '<div class="v-body">' + esc(v.draftContent) + '</div></div></label>';
    }).join('');
    list.querySelectorAll('input[name="variant"]').forEach(inp => inp.addEventListener('change', () => {
      variantIndex = Number(inp.value);
      list.querySelectorAll('.variant-item').forEach(el => el.classList.remove('selected'));
      inp.closest('.variant-item').classList.add('selected');
    }));
  } catch (e) { $('#variantList').innerHTML = '<div class="variant-spinner" style="color:#b91c1c">Error: ' + esc(e.message) + '</div>'; }
}

async function confirmVariant() {
  try {
    const r = await api('/api/cases/' + encodeURIComponent(variantCaseId) + '/choose-draft', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ index: variantIndex, channel: $('#vChannel').value }) });
    toast('Draft chosen → ' + r.currentState.replace(/_/g, ' ').toLowerCase());
    $('#variantModalBackdrop').classList.remove('show');
  } catch (e) { toast('Error: ' + e.message, true); }
  refresh();
}

async function runPipeline() {
  const btn = $('#confirmRun');
  btn.disabled = true; btn.textContent = 'Running...';
  try {
    const params = {
      industry: $('#fIndustry').value || undefined,
      region: $('#fRegion').value || undefined,
      keywords: $('#fKeywords').value || undefined,
      limit: Number($('#fLimit').value) || 50,
      tier: $('#fTier').value,
    };
    const url = '/api/run' + (mode === 'stage' ? '?mode=stage' : '');
    const r = await api(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(params) });
    toast(mode === 'stage'
      ? 'Prospecting complete: ' + r.total + ' qualified, ' + r.failed + ' failed'
      : 'Pipeline complete: ' + r.sent + ' sent, ' + r.failed + ' failed');
    $('#modalBackdrop').classList.remove('show');
  } catch (e) { toast('Error: ' + e.message, true); }
  btn.disabled = false; btn.textContent = 'Start';
  refresh();
}

// Wire events
$('#runBtn').addEventListener('click', () => {
  $('#modalHint').textContent = mode === 'full'
    ? 'Discover companies, build sites, draft and send proposals end-to-end.'
    : 'Individual stage: only discover and qualify prospects. Then advance them manually from the board.';
  $('#modalBackdrop').classList.add('show');
});
$('#cancelRun').addEventListener('click', () => $('#modalBackdrop').classList.remove('show'));
$('#modalBackdrop').addEventListener('click', (e) => { if (e.target === e.currentTarget) $('#modalBackdrop').classList.remove('show'); });
$('#confirmRun').addEventListener('click', runPipeline);

$('#cancelSite').addEventListener('click', () => $('#siteModalBackdrop').classList.remove('show'));
$('#siteModalBackdrop').addEventListener('click', (e) => { if (e.target === e.currentTarget) $('#siteModalBackdrop').classList.remove('show'); });
$('#confirmSite').addEventListener('click', confirmSiteBuild);

$('#cancelVariant').addEventListener('click', () => $('#variantModalBackdrop').classList.remove('show'));
$('#variantModalBackdrop').addEventListener('click', (e) => { if (e.target === e.currentTarget) $('#variantModalBackdrop').classList.remove('show'); });
$('#vChannel').addEventListener('change', () => { if (variantCaseId) generateVariants(variantCaseId); });
$('#confirmVariant').addEventListener('click', confirmVariant);

(async () => {
  try { themes = await api('/api/themes'); } catch (e) { themes = []; }
  refresh();
})();

$('#viewSwitch').querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
  $('#viewSwitch').querySelectorAll('button').forEach(x => x.classList.remove('active'));
  b.classList.add('active');
  activeView = b.dataset.view;
  $('#board').style.display = activeView === 'board' ? '' : 'none';
  $('#tableWrap').classList.toggle('show', activeView === 'list');
  if (activeView === 'list') renderList();
}));

$('#modeSwitch').querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
  $('#modeSwitch').querySelectorAll('button').forEach(x => x.classList.remove('active'));
  b.classList.add('active');
  mode = b.dataset.mode;
}));

$('#searchInput').addEventListener('input', (e) => { searchTerm = e.target.value; if (activeView === 'list') renderList(); });

setInterval(refresh, 5000);
</script>
</body>
</html>`;
}
