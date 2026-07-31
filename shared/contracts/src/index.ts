export {
  ProposalEventType,
  type DomainEvent,
  type ProspectDiscoveredPayload,
  type ProspectEnrichedPayload,
  type ProspectQualifiedPayload,
  type SiteDraftBuildingPayload,
  type SiteDraftReadyPayload,
  type ProposalDraftedPayload,
  type ProposalApprovedPayload,
  type ProposalSentPayload,
  type LeadRespondedPayload,
  type DealWonPayload,
  type DealLostPayload,
  type CaseStaledPayload,
  type ProposalEventPayloads,
  type ProposalEvent,
  type ProposalEvents,
} from './events';

export {
  ProposalState,
  ProposalCase,
  type ProposalCaseData,
} from './proposal-case';
