import { describe, it, expect } from 'vitest';
import { ProposalCase, ProposalState } from '@dias/contracts';
import { CaseWorkflow, CaseWorkflowDeps } from '@dias/pipeline';
import { InMemoryEventBus } from '@dias/pipeline';
import { CaseRepository } from '@dias/pipeline';
import { DashboardService } from './application/dashboard-service';

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

function makeWorkflow(repo: CaseRepository) {
  const deps: CaseWorkflowDeps = {
    repository: repo,
    publisher: new InMemoryEventBus(),
    prospectStep: { runJob: async () => ({ prospects: [] }) },
    siteStep: {
      buildSite: async () => ({ previewUrl: '/sites/x/index.html', tier: 'simple' }),
    },
    draftStep: {
      draft: async () => ({ channel: 'email', draftContent: 'draft' }),
      draftVariants: async (_company, channel, count) =>
        Array.from({ length: count }, (_, i) => ({
          channel,
          draftContent: `variant ${i}`,
        })),
    },
    sendStep: {
      send: async () => ({ sentAt: new Date().toISOString(), messageId: 'm1' }),
    },
  };
  return new CaseWorkflow(deps);
}

function seedDraftedCase(repo: CaseRepository): ProposalCase {
  const entity = ProposalCase.discover({
    companyName: 'Draft Co',
    industry: 'restaurants',
    region: 'Lisbon',
    source: 'test',
  });
  entity.markEnriched({ contactEmail: 'd@b.com', siteOutdated: true });
  entity.qualify({ reason: 'ok' });
  entity.startSiteBuild({ tier: 'simple' });
  entity.siteDraftReady({ previewUrl: '/sites/x/index.html', tier: 'simple' });
  entity.draftProposal({ channel: 'email', draftContent: 'proposal draft' });
  entity.updateMetadata({ draftContent: 'proposal draft', draftChannel: 'email' });
  repo.save(entity);
  return entity;
}

function seedQualifiedCase(repo: CaseRepository, name = 'Qualified Co'): ProposalCase {
  const entity = ProposalCase.discover({ companyName: name, source: 'test' });
  entity.markEnriched({ contactEmail: 'q@b.com', siteOutdated: true });
  entity.qualify({ reason: 'ok' });
  repo.save(entity);
  return entity;
}

describe('DashboardService', () => {
  it('groups cases into stage columns', () => {
    const repo = new MemoryRepository();
    seedDraftedCase(repo);
    const service = new DashboardService(repo, makeWorkflow(repo));

    const state = service.listCases();
    expect(state.totals.total).toBe(1);
    const proposal = state.stages.find((s) => s.stage.id === 'proposal')!;
    expect(proposal.count).toBe(1);
    expect(proposal.cases[0].stateLabel).toBe('Proposal drafted');
    expect(proposal.cases[0].stage).toBe('proposal');
    expect(proposal.cases[0].progress).toBe(55);
    expect(state.totals.canApprove).toBe(1);
  });

  it('exposes available actions per state', () => {
    const repo = new MemoryRepository();
    seedQualifiedCase(repo);
    const service = new DashboardService(repo, makeWorkflow(repo));

    const state = service.listCases();
    const discovery = state.stages.find((s) => s.stage.id === 'discovery')!;
    expect(discovery.cases[0].actions).toContain('build');
  });

  it('approves a PROPOSAL_DRAFTED case', () => {
    const repo = new MemoryRepository();
    const entity = seedDraftedCase(repo);
    const service = new DashboardService(repo, makeWorkflow(repo));

    const approved = service.approveCase(entity.getData().id, 'dashboard');
    expect(approved.getData().currentState).toBe(ProposalState.PROPOSAL_APPROVED);
    expect(repo.findById(entity.getData().id)?.getData().currentState).toBe(
      ProposalState.PROPOSAL_APPROVED,
    );
  });

  it('builds a site from a QUALIFIED case', async () => {
    const repo = new MemoryRepository();
    const entity = seedQualifiedCase(repo);
    const service = new DashboardService(repo, makeWorkflow(repo));

    const built = await service.buildSite(entity.getData().id, 'simple');
    expect(built.getData().currentState).toBe(ProposalState.SITE_DRAFT_READY);
  });

  it('does not approve cases not in PROPOSAL_DRAFTED', () => {
    const repo = new MemoryRepository();
    const entity = ProposalCase.discover({ companyName: 'X', source: 'test' });
    repo.save(entity);
    const service = new DashboardService(repo, makeWorkflow(repo));

    const result = service.approveCase(entity.getData().id, 'dashboard');
    expect(result.getData().currentState).toBe(ProposalState.DISCOVERED);
  });

  it('moves a RESPONDED case to WON via winCase', () => {
    const repo = new MemoryRepository();
    const entity = ProposalCase.discover({ companyName: 'R', source: 'test' });
    entity.markEnriched({ contactEmail: 'r@b.com', siteOutdated: false });
    entity.qualify({ reason: 'ok' });
    entity.startSiteBuild({ tier: 'simple' });
    entity.siteDraftReady({ previewUrl: 'x', tier: 'simple' });
    entity.draftProposal({ channel: 'email', draftContent: 'x' });
    entity.approve({ approvedBy: 'a' });
    entity.send({ channel: 'email', sentAt: 'now' });
    entity.respond({ responseContent: 'yes', responseChannel: 'email' });
    repo.save(entity);

    const service = new DashboardService(repo, makeWorkflow(repo));
    const won = service.winCase(entity.getData().id, 2500);
    expect(won.getData().currentState).toBe(ProposalState.WON);

    const state = service.listCases();
    expect(state.totals.won).toBe(1);
  });

  it('lists themes passed to the service', () => {
    const repo = new MemoryRepository();
    const themes = [
      { id: 'deep-navy', name: 'Deep Navy' },
      { id: 'fresh-green', name: 'Fresh Green' },
    ];
    const service = new DashboardService(repo, makeWorkflow(repo), themes);
    expect(service.listThemes()).toEqual(themes);
  });

  it('generates draft variants via the workflow and picks one', async () => {
    const repo = new MemoryRepository();
    const entity = seedQualifiedCase(repo);
    const service = new DashboardService(repo, makeWorkflow(repo));

    await service.buildSite(entity.getData().id, 'simple');
    const variants = await service.draftVariants(entity.getData().id, 'email', 3);
    expect(variants).toHaveLength(3);

    const chosen = await service.chooseDraft(entity.getData().id, 0, 'email');
    expect(chosen.getData().currentState).toBe(ProposalState.PROPOSAL_DRAFTED);
  });

  it('advances a case to a later stage', async () => {
    const repo = new MemoryRepository();
    const entity = seedQualifiedCase(repo);
    const service = new DashboardService(repo, makeWorkflow(repo));

    const advanced = await service.advanceToStage(entity.getData().id, 'building');
    expect(advanced.getData().currentState).toBe(ProposalState.SITE_DRAFT_READY);
  });
});
