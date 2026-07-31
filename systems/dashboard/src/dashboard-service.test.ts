import { describe, it, expect } from 'vitest';
import { ProposalCase, ProposalState, ProposalEventType } from '@dias/contracts';
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

describe('DashboardService', () => {
  it('lists cases grouped into state columns', () => {
    const repo = new MemoryRepository();
    seedDraftedCase(repo);
    const service = new DashboardService(repo, makeWorkflow(repo));

    const state = service.listCases();
    expect(state.total).toBe(1);
    expect(state.columns[ProposalState.PROPOSAL_DRAFTED]).toHaveLength(1);
    expect(state.canApprove).toBe(1);
    expect(state.columns[ProposalState.PROPOSAL_DRAFTED][0].draftContent).toBe('proposal draft');
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

  it('does not approve cases not in PROPOSAL_DRAFTED', () => {
    const repo = new MemoryRepository();
    const entity = ProposalCase.discover({ companyName: 'X', source: 'test' });
    repo.save(entity);
    const service = new DashboardService(repo, makeWorkflow(repo));

    const result = service.approveCase(entity.getData().id, 'dashboard');
    expect(result.getData().currentState).toBe(ProposalState.DISCOVERED);
  });

  it('runs the pipeline through the dashboard', async () => {
    const repo = new MemoryRepository();
    const service = new DashboardService(repo, makeWorkflow(repo));
    const summary = await service.runPipeline({ limit: 5 });
    expect(summary.total).toBe(0);
    expect(summary.sent).toBe(0);
  });
});
