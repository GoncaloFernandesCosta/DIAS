import { ProposalState } from '@dias/contracts';

export type StageId =
  | 'discovery'
  | 'building'
  | 'proposal'
  | 'outreach'
  | 'followup'
  | 'closed';

export interface StageInfo {
  id: StageId;
  label: string;
  description: string;
  color: string;
}

export interface StateMeta {
  label: string;
  stage: StageId;
  progress: number;
  description: string;
}

export const STAGES: StageInfo[] = [
  {
    id: 'discovery',
    label: 'Discovery',
    description: 'Companies found & qualified',
    color: '#3b82f6',
  },
  {
    id: 'building',
    label: 'Building',
    description: 'Website in progress',
    color: '#8b5cf6',
  },
  {
    id: 'proposal',
    label: 'Proposal',
    description: 'Draft awaiting approval',
    color: '#f59e0b',
  },
  {
    id: 'outreach',
    label: 'Outreach',
    description: 'Proposal sent',
    color: '#06b6d4',
  },
  {
    id: 'followup',
    label: 'Follow-up',
    description: 'Lead responded',
    color: '#14b8a6',
  },
  {
    id: 'closed',
    label: 'Closed',
    description: 'Won, lost or stale',
    color: '#64748b',
  },
];

export const STATE_META: Record<ProposalState, StateMeta> = {
  [ProposalState.DISCOVERED]: {
    label: 'Discovered',
    stage: 'discovery',
    progress: 5,
    description: 'Raw company found by a prospecting job',
  },
  [ProposalState.ENRICHED]: {
    label: 'Enriched',
    stage: 'discovery',
    progress: 15,
    description: 'Contacts & tech-stack audit completed',
  },
  [ProposalState.QUALIFIED]: {
    label: 'Qualified',
    stage: 'discovery',
    progress: 25,
    description: 'Matches ICP rules',
  },
  [ProposalState.SITE_DRAFT_BUILDING]: {
    label: 'Building site',
    stage: 'building',
    progress: 35,
    description: 'Site builder job running',
  },
  [ProposalState.SITE_DRAFT_READY]: {
    label: 'Site ready',
    stage: 'building',
    progress: 45,
    description: 'Preview available for review',
  },
  [ProposalState.PROPOSAL_DRAFTED]: {
    label: 'Proposal drafted',
    stage: 'proposal',
    progress: 55,
    description: 'Message generated, awaiting approval',
  },
  [ProposalState.PROPOSAL_APPROVED]: {
    label: 'Proposal approved',
    stage: 'proposal',
    progress: 65,
    description: 'Ready to send',
  },
  [ProposalState.PROPOSAL_SENT]: {
    label: 'Proposal sent',
    stage: 'outreach',
    progress: 75,
    description: 'Email / SMS dispatched',
  },
  [ProposalState.RESPONDED]: {
    label: 'Responded',
    stage: 'followup',
    progress: 85,
    description: 'Lead replied — decide next step',
  },
  [ProposalState.WON]: {
    label: 'Won',
    stage: 'closed',
    progress: 100,
    description: 'Deal closed',
  },
  [ProposalState.LOST]: {
    label: 'Lost',
    stage: 'closed',
    progress: 100,
    description: 'Deal lost',
  },
  [ProposalState.STALE]: {
    label: 'Stale',
    stage: 'closed',
    progress: 100,
    description: 'No progress, archived',
  },
};

export type CaseAction = 'build' | 'draft' | 'approve' | 'send' | 'win' | 'lose';

export const ACTION_BY_STATE: Record<ProposalState, CaseAction[]> = {
  [ProposalState.DISCOVERED]: [],
  [ProposalState.ENRICHED]: [],
  [ProposalState.QUALIFIED]: ['build'],
  [ProposalState.SITE_DRAFT_BUILDING]: [],
  [ProposalState.SITE_DRAFT_READY]: ['draft'],
  [ProposalState.PROPOSAL_DRAFTED]: ['approve'],
  [ProposalState.PROPOSAL_APPROVED]: ['send'],
  [ProposalState.PROPOSAL_SENT]: [],
  [ProposalState.RESPONDED]: ['win', 'lose'],
  [ProposalState.WON]: [],
  [ProposalState.LOST]: [],
  [ProposalState.STALE]: [],
};

export function stageFor(id: StageId): StageInfo {
  return STAGES.find((s) => s.id === id)!;
}
