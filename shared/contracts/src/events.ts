export enum ProposalEventType {
  DISCOVERED = 'DISCOVERED',
  ENRICHED = 'ENRICHED',
  QUALIFIED = 'QUALIFIED',
  SITE_DRAFT_BUILDING = 'SITE_DRAFT_BUILDING',
  SITE_DRAFT_READY = 'SITE_DRAFT_READY',
  PROPOSAL_DRAFTED = 'PROPOSAL_DRAFTED',
  PROPOSAL_APPROVED = 'PROPOSAL_APPROVED',
  PROPOSAL_SENT = 'PROPOSAL_SENT',
  RESPONDED = 'RESPONDED',
  WON = 'WON',
  LOST = 'LOST',
  STALE = 'STALE',
}

export interface DomainEvent<T extends string = string, P = unknown> {
  eventId: string;
  eventType: T;
  aggregateId: string;
  payload: P;
  occurredAt: string;
}

export interface ProspectDiscoveredPayload {
  companyName: string;
  industry?: string;
  region?: string;
  website?: string;
  source: string;
}

export interface ProspectEnrichedPayload {
  contactEmail?: string;
  contactPhone?: string;
  techStack?: string[];
  siteOutdated: boolean;
}

export interface ProspectQualifiedPayload {
  reason: string;
}

export interface SiteDraftBuildingPayload {
  tier: 'simple' | 'complex';
}

export interface SiteDraftReadyPayload {
  previewUrl: string;
  tier: 'simple' | 'complex';
}

export interface ProposalDraftedPayload {
  channel: 'email' | 'sms';
  draftContent: string;
}

export interface ProposalApprovedPayload {
  approvedBy: string;
}

export interface ProposalSentPayload {
  channel: 'email' | 'sms';
  sentAt: string;
}

export interface LeadRespondedPayload {
  responseContent: string;
  responseChannel: 'email' | 'sms';
}

export interface DealWonPayload {
  dealValue?: number;
}

export interface DealLostPayload {
  reason?: string;
}

export interface CaseStaledPayload {
  previousState: string;
  reason?: string;
}

export type ProposalEventPayloads = {
  [ProposalEventType.DISCOVERED]: ProspectDiscoveredPayload;
  [ProposalEventType.ENRICHED]: ProspectEnrichedPayload;
  [ProposalEventType.QUALIFIED]: ProspectQualifiedPayload;
  [ProposalEventType.SITE_DRAFT_BUILDING]: SiteDraftBuildingPayload;
  [ProposalEventType.SITE_DRAFT_READY]: SiteDraftReadyPayload;
  [ProposalEventType.PROPOSAL_DRAFTED]: ProposalDraftedPayload;
  [ProposalEventType.PROPOSAL_APPROVED]: ProposalApprovedPayload;
  [ProposalEventType.PROPOSAL_SENT]: ProposalSentPayload;
  [ProposalEventType.RESPONDED]: LeadRespondedPayload;
  [ProposalEventType.WON]: DealWonPayload;
  [ProposalEventType.LOST]: DealLostPayload;
  [ProposalEventType.STALE]: CaseStaledPayload;
};

export type ProposalEvent<T extends ProposalEventType = ProposalEventType> =
  DomainEvent<T, ProposalEventPayloads[T]>;

export type ProposalEvents = {
  [K in ProposalEventType]: DomainEvent<K, ProposalEventPayloads[K]>;
}[ProposalEventType];
