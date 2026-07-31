import {
  ProposalCase,
  ProposalState,
  ProposalCaseData,
} from '@dias/contracts';
import { CaseWorkflow } from '@dias/pipeline';
import { CaseRepository } from '@dias/pipeline';
import { PipelineRunParams } from '@dias/pipeline';
import { PipelineRunSummary } from '@dias/pipeline';
import {
  CaseAction,
  StageId,
  StageInfo,
  STATE_META,
  ACTION_BY_STATE,
  STAGES,
  stageFor,
} from './stage';

export interface CaseView {
  id: string;
  companyName: string;
  initials: string;
  industry?: string;
  region?: string;
  website?: string;
  techStack?: string[];
  siteOutdated: boolean;
  contactEmail?: string;
  currentState: ProposalState;
  stateLabel: string;
  stateDescription: string;
  stage: StageId;
  stageColor: string;
  progress: number;
  actions: CaseAction[];
  previewUrl?: string;
  draftContent?: string;
  draftSubject?: string;
  draftVariants?: Array<{ channel: string; subject?: string; draftContent: string }>;
  siteTier?: string;
  siteTheme?: string;
  sentAt?: string;
  wonAt?: string;
  updatedAt: string;
}

export interface StageColumn {
  stage: StageInfo;
  cases: CaseView[];
  count: number;
}

export interface Totals {
  total: number;
  discovery: number;
  building: number;
  proposal: number;
  outreach: number;
  responded: number;
  won: number;
  lost: number;
  canApprove: number;
}

export interface DashboardState {
  stages: StageColumn[];
  totals: Totals;
}

export class DashboardService {
  constructor(
    private readonly repository: CaseRepository,
    private readonly workflow: CaseWorkflow,
    private readonly themes: Array<{ id: string; name: string }> = [],
  ) {}

  listThemes(): Array<{ id: string; name: string }> {
    return this.themes;
  }

  listCases(): DashboardState {
    const cases = this.repository.findAll();
    const byStage: Record<StageId, CaseView[]> = Object.fromEntries(
      STAGES.map((s) => [s.id, [] as CaseView[]]),
    ) as Record<StageId, CaseView[]>;

    const totals: Totals = {
      total: cases.length,
      discovery: 0,
      building: 0,
      proposal: 0,
      outreach: 0,
      responded: 0,
      won: 0,
      lost: 0,
      canApprove: 0,
    };

    for (const entity of cases) {
      const view = this.toView(entity);
      byStage[view.stage].push(view);
      switch (view.currentState) {
        case ProposalState.PROPOSAL_DRAFTED:
          totals.proposal += 1;
          totals.canApprove += 1;
          break;
        case ProposalState.PROPOSAL_APPROVED:
          totals.proposal += 1;
          break;
        case ProposalState.PROPOSAL_SENT:
          totals.outreach += 1;
          break;
        case ProposalState.RESPONDED:
          totals.responded += 1;
          break;
        case ProposalState.WON:
          totals.won += 1;
          break;
        case ProposalState.LOST:
          totals.lost += 1;
          break;
        default:
          totals.discovery += 1;
          break;
      }
    }

    const stages: StageColumn[] = STAGES.map((stage) => ({
      stage,
      cases: byStage[stage.id],
      count: byStage[stage.id].length,
    }));

    return { stages, totals };
  }

  approveCase(caseId: string, approvedBy = 'dashboard'): ProposalCase {
    return this.workflow.approve(caseId, approvedBy);
  }

  async buildSite(caseId: string, tier: 'simple' | 'complex' = 'simple', theme?: string): Promise<ProposalCase> {
    return this.workflow.buildSite(caseId, tier, theme);
  }

  async rebuildSite(caseId: string, tier: 'simple' | 'complex' = 'simple', theme?: string): Promise<ProposalCase> {
    return this.workflow.rebuildSite(caseId, tier, theme);
  }

  async draftVariants(
    caseId: string,
    channel: 'email' | 'sms' = 'email',
    count = 3,
  ): Promise<Array<{ channel: 'email' | 'sms'; subject?: string; draftContent: string }>> {
    return this.workflow.draftVariants(caseId, channel, count);
  }

  async chooseDraft(caseId: string, index: number, channel: 'email' | 'sms' = 'email'): Promise<ProposalCase> {
    return this.workflow.chooseDraft(caseId, index, channel);
  }

  async advanceToStage(caseId: string, stage: string): Promise<ProposalCase> {
    return this.workflow.advanceToStage(caseId, stage);
  }

  async draftProposal(caseId: string, channel: 'email' | 'sms' = 'email'): Promise<ProposalCase> {
    return this.workflow.draft(caseId, channel);
  }

  async sendProposal(caseId: string, channel: 'email' | 'sms' = 'email'): Promise<ProposalCase> {
    return this.workflow.send(caseId, channel);
  }

  winCase(caseId: string, dealValue?: number): ProposalCase {
    return this.workflow.win(caseId, dealValue);
  }

  loseCase(caseId: string, reason?: string): ProposalCase {
    return this.workflow.lose(caseId, reason);
  }

  async runPipeline(params: PipelineRunParams): Promise<PipelineRunSummary> {
    return this.workflow.run(params);
  }

  async runProspectOnly(params: PipelineRunParams): Promise<PipelineRunSummary> {
    return this.workflow.prospectOnly(params);
  }

  private toView(entity: ProposalCase): CaseView {
    const d: ProposalCaseData = entity.getData();
    const meta = STATE_META[d.currentState];
    return {
      id: d.id,
      companyName: d.companyName,
      initials: this.initials(d.companyName),
      industry: d.industry,
      region: d.region,
      website: d.website,
      techStack: d.techStack,
      siteOutdated: d.siteOutdated,
      contactEmail: d.contactEmail,
      currentState: d.currentState,
      stateLabel: meta.label,
      stateDescription: meta.description,
      stage: meta.stage,
      stageColor: stageFor(meta.stage).color,
      progress: meta.progress,
      actions: ACTION_BY_STATE[d.currentState],
      previewUrl: d.metadata.previewUrl as string | undefined,
      draftContent: d.metadata.draftContent as string | undefined,
      draftSubject: d.metadata.draftSubject as string | undefined,
      draftVariants: d.metadata.draftVariants as CaseView['draftVariants'],
      siteTier: d.metadata.siteTier as string | undefined,
      siteTheme: d.metadata.siteTheme as string | undefined,
      sentAt: d.metadata.sentAt as string | undefined,
      wonAt: d.metadata.sentAt as string | undefined,
      updatedAt: d.updatedAt,
    };
  }

  private initials(companyName: string): string {
    return companyName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join('');
  }
}
