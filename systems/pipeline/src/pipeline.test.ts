import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ProposalCase, ProposalState, ProposalEventType, ProposalEvents } from '@dias/contracts';
import { ProspectingService, LocalSearchAdapter, StaticEnrichmentAdapter } from '@dias/prospecting';
import { SiteBuilderService, StaticHtmlSiteRenderer } from '@dias/site-builder';
import { OutreachService, TemplateMessageGenerator, ConsoleNotificationProvider } from '@dias/outreach';
import { CaseWorkflow, CaseWorkflowDeps } from './application/case-workflow';
import { SqliteCaseRepository } from './infrastructure/sqlite-case-repository';
import { InMemoryEventBus } from './infrastructure/in-memory-event-bus';
import { CaseRepository } from './application/ports';

class MemoryRepository implements CaseRepository {
  private store = new Map<string, string>();

  save(caseEntity: ProposalCase): void {
    this.store.set(caseEntity.getData().id, JSON.stringify(caseEntity.getData()));
  }

  findById(id: string): ProposalCase | null {
    const raw = this.store.get(id);
    return raw ? ProposalCase.load(JSON.parse(raw)) : null;
  }

  findAll(): ProposalCase[] {
    return [...this.store.values()].map((raw) => ProposalCase.load(JSON.parse(raw)));
  }

  findByState(state: ProposalState): ProposalCase[] {
    return this.findAll().filter((c) => c.getData().currentState === state);
  }
}

function makeWorkflow(repository: CaseRepository, eventBus: InMemoryEventBus) {
  const prospecting = new ProspectingService(
    new LocalSearchAdapter(),
    new StaticEnrichmentAdapter(),
  );
  const siteBuilder = new SiteBuilderService(
    new StaticHtmlSiteRenderer({ sitesRoot: '.dias-test-sites', previewBaseUrl: '/sites' }),
  );
  const outreach = new OutreachService(
    new TemplateMessageGenerator(),
    new ConsoleNotificationProvider(),
  );

  const deps: CaseWorkflowDeps = {
    repository,
    publisher: eventBus,
    prospectStep: { runJob: (p) => prospecting.runJob(p) },
    siteStep: {
      buildSite: async (caseId, company, tier) => {
        const built = await siteBuilder.buildSite(company as never, tier);
        return { previewUrl: built.previewUrl, tier: built.tier };
      },
    },
    draftStep: {
      draft: async (company, channel) => {
        const d = await outreach.draft(company as never, channel);
        return { channel: d.channel, subject: d.subject, draftContent: d.draftContent };
      },
    },
    sendStep: {
      send: async (company, draft) => {
        const s = await outreach.send(company as never, draft);
        return { sentAt: s.sentAt, messageId: s.messageId };
      },
    },
  };
  return new CaseWorkflow(deps);
}

describe('InMemoryEventBus', () => {
  it('delivers to subscribers by event type and wildcard', () => {
    const bus = new InMemoryEventBus();
    const received: ProposalEvents[] = [];
    bus.subscribe(ProposalEventType.DISCOVERED, (e) => received.push(e));
    bus.subscribe('*', (e) => received.push(e));

    const entity = ProposalCase.discover({ companyName: 'X', source: 'test' });
    for (const event of entity.drainEvents()) bus.publish(event);

    expect(received).toHaveLength(2);
    expect(received[0].eventType).toBe(ProposalEventType.DISCOVERED);
  });
});

describe('CaseWorkflow', () => {
  it('ingests a prospect to QUALIFIED and persists it', () => {
    const repo = new MemoryRepository();
    const bus = new InMemoryEventBus();
    const wf = makeWorkflow(repo, bus);

    const entity = wf.ingestProspect({
      companyName: 'Acme Corp',
      industry: 'restaurants',
      region: 'Lisbon',
      website: 'https://acme.example.com',
      contactEmail: 'a@b.com',
      techStack: ['php'],
      siteOutdated: true,
    });

    expect(entity.getData().currentState).toBe(ProposalState.QUALIFIED);
    expect(repo.findById(entity.getData().id)).not.toBeNull();
  });

  it('builds a site from QUALIFIED to SITE_DRAFT_READY', async () => {
    const repo = new MemoryRepository();
    const bus = new InMemoryEventBus();
    const wf = makeWorkflow(repo, bus);

    const entity = wf.ingestProspect({
      companyName: 'Acme Corp',
      website: 'https://acme.example.com',
      contactEmail: 'a@b.com',
      siteOutdated: true,
    });
    const id = entity.getData().id;

    const after = await wf.buildSite(id, 'simple');
    expect(after.getData().currentState).toBe(ProposalState.SITE_DRAFT_READY);
    expect(after.getData().metadata.previewUrl).toContain('/sites/');
  });

  it('runs the full pipeline and ends cases at PROPOSAL_SENT', async () => {
    const repo = new MemoryRepository();
    const bus = new InMemoryEventBus();
    const wf = makeWorkflow(repo, bus);

    const summary = await wf.run({ industry: 'restaurants', region: 'Lisbon', limit: 10 });

    expect(summary.total).toBe(2);
    expect(summary.sent).toBe(2);
    expect(summary.failed).toBe(0);
    expect(summary.cases.every((c) => c.currentState === ProposalState.PROPOSAL_SENT)).toBe(true);
  });

  it('draft + approve + send walks the tail of the state machine', async () => {
    const repo = new MemoryRepository();
    const bus = new InMemoryEventBus();
    const wf = makeWorkflow(repo, bus);

    const entity = wf.ingestProspect({
      companyName: 'Tail Co',
      website: 'https://tail.example.com',
      contactEmail: 't@b.com',
      siteOutdated: true,
    });
    const id = entity.getData().id;
    await wf.buildSite(id, 'simple');
    await wf.draft(id, 'email');
    expect(repo.findById(id)?.getData().currentState).toBe(ProposalState.PROPOSAL_DRAFTED);

    wf.approve(id, 'test');
    expect(repo.findById(id)?.getData().currentState).toBe(ProposalState.PROPOSAL_APPROVED);

    await wf.send(id, 'email');
    expect(repo.findById(id)?.getData().currentState).toBe(ProposalState.PROPOSAL_SENT);
  });

  it('publishes domain events to the bus during a run', async () => {
    const repo = new MemoryRepository();
    const bus = new InMemoryEventBus();
    const types: ProposalEventType[] = [];
    bus.subscribe('*', (e) => types.push(e.eventType));

    const wf = makeWorkflow(repo, bus);
    await wf.run({ industry: 'printing', limit: 10 });

    expect(types).toContain(ProposalEventType.DISCOVERED);
    expect(types).toContain(ProposalEventType.ENRICHED);
    expect(types).toContain(ProposalEventType.QUALIFIED);
    expect(types).toContain(ProposalEventType.SITE_DRAFT_BUILDING);
    expect(types).toContain(ProposalEventType.SITE_DRAFT_READY);
    expect(types).toContain(ProposalEventType.PROPOSAL_DRAFTED);
    expect(types).toContain(ProposalEventType.PROPOSAL_APPROVED);
    expect(types).toContain(ProposalEventType.PROPOSAL_SENT);
  });

  it('throws when building a site for a missing case', async () => {
    const repo = new MemoryRepository();
    const wf = makeWorkflow(repo, new InMemoryEventBus());
    await expect(wf.buildSite('missing-id', 'simple')).rejects.toThrow(/not found/);
  });
});

describe('SqliteCaseRepository', () => {
  let tempDir: string;
  const openRepos: SqliteCaseRepository[] = [];

  beforeAll(() => {
    tempDir = mkdtempSync(join(tmpdir(), 'dias-repo-test-'));
  });

  afterAll(() => {
    for (const repo of openRepos) repo.close();
    rmSync(tempDir, { recursive: true, force: true });
  });

  function makeRepo(name: string): SqliteCaseRepository {
    const r = new SqliteCaseRepository(join(tempDir, name));
    openRepos.push(r);
    return r;
  }

  it('persists and reloads a case', () => {
    const repo = makeRepo('test.db');
    const entity = ProposalCase.discover({ companyName: 'Sqlite Co', source: 'test' });
    entity.markEnriched({ contactEmail: 's@b.com', siteOutdated: true });
    entity.qualify({ reason: 'ok' });
    repo.save(entity);

    const loaded = repo.findById(entity.getData().id);
    expect(loaded).not.toBeNull();
    expect(loaded?.getData().companyName).toBe('Sqlite Co');
    expect(loaded?.getData().currentState).toBe(ProposalState.QUALIFIED);

    const all = repo.findAll();
    expect(all.map((c) => c.getData().id)).toContain(entity.getData().id);
  });

  it('finds cases by state', () => {
    const repo = makeRepo('state.db');
    const a = ProposalCase.discover({ companyName: 'A', source: 'test' });
    const b = ProposalCase.discover({ companyName: 'B', source: 'test' });
    b.markEnriched({ contactEmail: 'b@b.com', siteOutdated: false });
    repo.save(a);
    repo.save(b);

    const discovered = repo.findByState(ProposalState.DISCOVERED);
    expect(discovered).toHaveLength(1);
    expect(discovered[0].getData().companyName).toBe('A');
  });

  it('appends events and preserves aggregate id', () => {
    const repo = makeRepo('events.db');
    const entity = ProposalCase.discover({ companyName: 'Evt', source: 'test' });
    entity.markEnriched({ contactEmail: 'e@b.com', siteOutdated: false });
    repo.save(entity);

    const reloaded = repo.findById(entity.getData().id);
    reloaded?.drainEvents();
    reloaded?.qualify({ reason: 'after reload' });
    repo.save(reloaded!);

    const again = repo.findById(entity.getData().id);
    expect(again?.getData().currentState).toBe(ProposalState.QUALIFIED);
  });

  it('returns null for unknown ids', () => {
    const repo = makeRepo('missing.db');
    expect(repo.findById('nope')).toBeNull();
  });
});
