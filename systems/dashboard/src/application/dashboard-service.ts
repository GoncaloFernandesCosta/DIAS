import {
  ProposalCase,
  ProposalState,
  ProposalCaseData,
} from '@dias/contracts';
import { CaseWorkflow } from '@dias/pipeline';
import { CaseRepository } from '@dias/pipeline';
import { PipelineRunParams } from '@dias/pipeline';
import { PipelineRunSummary } from '@dias/pipeline';

export interface CaseView {
  id: string;
  companyName: string;
  industry?: string;
  region?: string;
  website?: string;
  techStack?: string[];
  siteOutdated: boolean;
  contactEmail?: string;
  currentState: ProposalState;
  previewUrl?: string;
  draftContent?: string;
  sentAt?: string;
  updatedAt: string;
}

export interface DashboardState {
  columns: Record<ProposalState, CaseView[]>;
  total: number;
  canApprove: number;
}

export class DashboardService {
  constructor(
    private readonly repository: CaseRepository,
    private readonly workflow: CaseWorkflow,
  ) {}

  listCases(): DashboardState {
    const cases = this.repository.findAll();
    const columns = Object.fromEntries(
      Object.values(ProposalState).map((s) => [s, [] as CaseView[]]),
    ) as Record<ProposalState, CaseView[]>;

    let canApprove = 0;
    for (const entity of cases) {
      const view = this.toView(entity);
      columns[view.currentState].push(view);
      if (view.currentState === ProposalState.PROPOSAL_DRAFTED) canApprove += 1;
    }

    return { columns, total: cases.length, canApprove };
  }

  approveCase(caseId: string, approvedBy = 'dashboard'): ProposalCase {
    return this.workflow.approve(caseId, approvedBy);
  }

  async runPipeline(params: PipelineRunParams): Promise<PipelineRunSummary> {
    return this.workflow.run(params);
  }

  private toView(entity: ProposalCase): CaseView {
    const d: ProposalCaseData = entity.getData();
    return {
      id: d.id,
      companyName: d.companyName,
      industry: d.industry,
      region: d.region,
      website: d.website,
      techStack: d.techStack,
      siteOutdated: d.siteOutdated,
      contactEmail: d.contactEmail,
      currentState: d.currentState,
      previewUrl: d.metadata.previewUrl as string | undefined,
      draftContent: d.metadata.draftContent as string | undefined,
      sentAt: d.metadata.sentAt as string | undefined,
      updatedAt: d.updatedAt,
    };
  }
}
