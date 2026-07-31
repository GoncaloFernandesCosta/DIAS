import { v4 as uuidv4 } from 'uuid';
import {
  ProposalEventType,
  ProposalEvents,
  ProspectDiscoveredPayload,
  ProspectEnrichedPayload,
  ProspectQualifiedPayload,
  SiteDraftBuildingPayload,
  SiteDraftReadyPayload,
  ProposalDraftedPayload,
  ProposalApprovedPayload,
  ProposalSentPayload,
  LeadRespondedPayload,
  DealWonPayload,
  DealLostPayload,
  CaseStaledPayload,
  ProposalEventPayloads,
} from './events';

export enum ProposalState {
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

interface TransitionRule {
  from: ProposalState[];
  to: ProposalState;
}

const TRANSITIONS: Record<string, TransitionRule> = {
  [ProposalEventType.ENRICHED]: {
    from: [ProposalState.DISCOVERED],
    to: ProposalState.ENRICHED,
  },
  [ProposalEventType.QUALIFIED]: {
    from: [ProposalState.ENRICHED],
    to: ProposalState.QUALIFIED,
  },
  [ProposalEventType.SITE_DRAFT_BUILDING]: {
    from: [ProposalState.QUALIFIED],
    to: ProposalState.SITE_DRAFT_BUILDING,
  },
  [ProposalEventType.SITE_DRAFT_READY]: {
    from: [ProposalState.SITE_DRAFT_BUILDING],
    to: ProposalState.SITE_DRAFT_READY,
  },
  [ProposalEventType.PROPOSAL_DRAFTED]: {
    from: [ProposalState.SITE_DRAFT_READY],
    to: ProposalState.PROPOSAL_DRAFTED,
  },
  [ProposalEventType.PROPOSAL_APPROVED]: {
    from: [ProposalState.PROPOSAL_DRAFTED],
    to: ProposalState.PROPOSAL_APPROVED,
  },
  [ProposalEventType.PROPOSAL_SENT]: {
    from: [ProposalState.PROPOSAL_APPROVED],
    to: ProposalState.PROPOSAL_SENT,
  },
  [ProposalEventType.RESPONDED]: {
    from: [ProposalState.PROPOSAL_SENT],
    to: ProposalState.RESPONDED,
  },
  [ProposalEventType.WON]: {
    from: [ProposalState.RESPONDED],
    to: ProposalState.WON,
  },
  [ProposalEventType.LOST]: {
    from: [ProposalState.RESPONDED],
    to: ProposalState.LOST,
  },
  [ProposalEventType.STALE]: {
    from: [
      ProposalState.DISCOVERED,
      ProposalState.ENRICHED,
      ProposalState.QUALIFIED,
      ProposalState.SITE_DRAFT_BUILDING,
      ProposalState.SITE_DRAFT_READY,
      ProposalState.PROPOSAL_DRAFTED,
      ProposalState.PROPOSAL_APPROVED,
      ProposalState.PROPOSAL_SENT,
      ProposalState.RESPONDED,
    ],
    to: ProposalState.STALE,
  },
};

const TERMINAL_STATES: ProposalState[] = [
  ProposalState.WON,
  ProposalState.LOST,
  ProposalState.STALE,
];

export interface ProposalCaseData {
  id: string;
  companyName: string;
  industry?: string;
  region?: string;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  techStack?: string[];
  siteOutdated: boolean;
  currentState: ProposalState;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export class ProposalCase {
  private data: ProposalCaseData;
  private events: ProposalEvents[] = [];

  private constructor(data: ProposalCaseData) {
    this.data = { ...data };
  }

  static discover(payload: ProspectDiscoveredPayload): ProposalCase {
    const now = new Date().toISOString();
    const instance = new ProposalCase({
      id: uuidv4(),
      companyName: payload.companyName,
      industry: payload.industry,
      region: payload.region,
      website: payload.website,
      contactEmail: undefined,
      contactPhone: undefined,
      techStack: undefined,
      siteOutdated: false,
      currentState: ProposalState.DISCOVERED,
      metadata: {},
      createdAt: now,
      updatedAt: now,
    });
    instance.recordEvent(ProposalEventType.DISCOVERED, payload);
    return instance;
  }

  static load(data: ProposalCaseData): ProposalCase {
    return new ProposalCase(data);
  }

  private transition(eventType: ProposalEventType): void {
    const rule = TRANSITIONS[eventType];
    if (!rule) {
      throw new Error(`Unknown transition event: ${eventType}`);
    }
    if (!rule.from.includes(this.data.currentState)) {
      throw new Error(
        `Invalid transition from ${this.data.currentState} via ${eventType}. Allowed from: ${rule.from.join(', ')}`
      );
    }
    if (TERMINAL_STATES.includes(this.data.currentState)) {
      throw new Error(
        `Cannot transition from terminal state ${this.data.currentState}`
      );
    }
  }

  private recordEvent<K extends ProposalEventType>(
    eventType: K,
    payload: ProposalEventPayloads[K],
  ): void {
    this.events.push({
      eventId: uuidv4(),
      eventType,
      aggregateId: this.data.id,
      payload: payload as any,
      occurredAt: new Date().toISOString(),
    });
  }

  markEnriched(payload: ProspectEnrichedPayload): void {
    this.transition(ProposalEventType.ENRICHED);
    this.data.contactEmail = payload.contactEmail;
    this.data.contactPhone = payload.contactPhone;
    this.data.techStack = payload.techStack;
    this.data.siteOutdated = payload.siteOutdated;
    this.data.currentState = ProposalState.ENRICHED;
    this.data.updatedAt = new Date().toISOString();
    this.recordEvent(ProposalEventType.ENRICHED, payload);
  }

  qualify(payload: ProspectQualifiedPayload): void {
    this.transition(ProposalEventType.QUALIFIED);
    this.data.currentState = ProposalState.QUALIFIED;
    this.data.updatedAt = new Date().toISOString();
    this.recordEvent(ProposalEventType.QUALIFIED, payload);
  }

  startSiteBuild(payload: SiteDraftBuildingPayload): void {
    this.transition(ProposalEventType.SITE_DRAFT_BUILDING);
    this.data.currentState = ProposalState.SITE_DRAFT_BUILDING;
    this.data.updatedAt = new Date().toISOString();
    this.recordEvent(ProposalEventType.SITE_DRAFT_BUILDING, payload);
  }

  siteDraftReady(payload: SiteDraftReadyPayload): void {
    this.transition(ProposalEventType.SITE_DRAFT_READY);
    this.data.currentState = ProposalState.SITE_DRAFT_READY;
    this.data.updatedAt = new Date().toISOString();
    this.recordEvent(ProposalEventType.SITE_DRAFT_READY, payload);
  }

  draftProposal(payload: ProposalDraftedPayload): void {
    this.transition(ProposalEventType.PROPOSAL_DRAFTED);
    this.data.currentState = ProposalState.PROPOSAL_DRAFTED;
    this.data.updatedAt = new Date().toISOString();
    this.recordEvent(ProposalEventType.PROPOSAL_DRAFTED, payload);
  }

  approve(payload: ProposalApprovedPayload): void {
    this.transition(ProposalEventType.PROPOSAL_APPROVED);
    this.data.currentState = ProposalState.PROPOSAL_APPROVED;
    this.data.updatedAt = new Date().toISOString();
    this.recordEvent(ProposalEventType.PROPOSAL_APPROVED, payload);
  }

  send(payload: ProposalSentPayload): void {
    this.transition(ProposalEventType.PROPOSAL_SENT);
    this.data.currentState = ProposalState.PROPOSAL_SENT;
    this.data.updatedAt = new Date().toISOString();
    this.recordEvent(ProposalEventType.PROPOSAL_SENT, payload);
  }

  respond(payload: LeadRespondedPayload): void {
    this.transition(ProposalEventType.RESPONDED);
    this.data.currentState = ProposalState.RESPONDED;
    this.data.updatedAt = new Date().toISOString();
    this.recordEvent(ProposalEventType.RESPONDED, payload);
  }

  markWon(payload: DealWonPayload = {}): void {
    this.transition(ProposalEventType.WON);
    this.data.currentState = ProposalState.WON;
    this.data.updatedAt = new Date().toISOString();
    this.recordEvent(ProposalEventType.WON, payload);
  }

  markLost(payload: DealLostPayload = {}): void {
    this.transition(ProposalEventType.LOST);
    this.data.currentState = ProposalState.LOST;
    this.data.updatedAt = new Date().toISOString();
    this.recordEvent(ProposalEventType.LOST, payload);
  }

  markStale(payload: Partial<CaseStaledPayload> = {}): void {
    const fullPayload: CaseStaledPayload = {
      previousState: this.data.currentState,
      ...payload,
    };
    this.transition(ProposalEventType.STALE);
    this.data.currentState = ProposalState.STALE;
    this.data.updatedAt = new Date().toISOString();
    this.recordEvent(ProposalEventType.STALE, fullPayload);
  }

  updateMetadata(updates: Record<string, unknown>): void {
    this.data.metadata = { ...this.data.metadata, ...updates };
    this.data.updatedAt = new Date().toISOString();
  }

  getData(): ProposalCaseData {
    return { ...this.data };
  }

  getEvents(): ProposalEvents[] {
    return [...this.events];
  }

  drainEvents(): ProposalEvents[] {
    const emitted = [...this.events];
    this.events = [];
    return emitted;
  }
}


