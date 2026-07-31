import { describe, it, expect } from 'vitest';
import { ProposalCase, ProposalState, ProposalEventType } from './index';

describe('ProposalCase', () => {
  const basePayload = {
    companyName: 'Acme Corp',
    industry: 'restaurants',
    region: 'Lisbon',
    website: 'https://acme.example.com',
    source: 'google',
  };

  describe('discover', () => {
    it('creates a case in DISCOVERED state', () => {
      const c = ProposalCase.discover(basePayload);
      expect(c.getData().currentState).toBe(ProposalState.DISCOVERED);
    });

    it('generates an id', () => {
      const c = ProposalCase.discover(basePayload);
      expect(c.getData().id).toBeTruthy();
      expect(typeof c.getData().id).toBe('string');
    });

    it('records a DISCOVERED event', () => {
      const c = ProposalCase.discover(basePayload);
      const events = c.getEvents();
      expect(events).toHaveLength(1);
      expect(events[0].eventType).toBe(ProposalEventType.DISCOVERED);
      expect(events[0].payload).toMatchObject(basePayload);
    });

    it('sets default values correctly', () => {
      const c = ProposalCase.discover(basePayload);
      const d = c.getData();
      expect(d.companyName).toBe('Acme Corp');
      expect(d.industry).toBe('restaurants');
      expect(d.region).toBe('Lisbon');
      expect(d.website).toBe('https://acme.example.com');
      expect(d.siteOutdated).toBe(false);
      expect(d.metadata).toEqual({});
      expect(d.contactEmail).toBeUndefined();
      expect(d.contactPhone).toBeUndefined();
      expect(d.techStack).toBeUndefined();
    });

    it('sets timestamps on creation', () => {
      const c = ProposalCase.discover(basePayload);
      const d = c.getData();
      expect(d.createdAt).toBeTruthy();
      expect(d.updatedAt).toBe(d.createdAt);
    });

    it('each discovery generates a unique id', () => {
      const a = ProposalCase.discover(basePayload);
      const b = ProposalCase.discover(basePayload);
      expect(a.getData().id).not.toBe(b.getData().id);
    });
  });

  describe('full happy path to WON', () => {
    it('walks through every transition to WON', () => {
      const c = ProposalCase.discover(basePayload);
      expect(c.getData().currentState).toBe(ProposalState.DISCOVERED);

      c.markEnriched({ contactEmail: 'a@b.com', siteOutdated: true, techStack: ['php'] });
      expect(c.getData().currentState).toBe(ProposalState.ENRICHED);
      expect(c.getData().contactEmail).toBe('a@b.com');
      expect(c.getData().siteOutdated).toBe(true);

      c.qualify({ reason: 'outdated site' });
      expect(c.getData().currentState).toBe(ProposalState.QUALIFIED);

      c.startSiteBuild({ tier: 'simple' });
      expect(c.getData().currentState).toBe(ProposalState.SITE_DRAFT_BUILDING);

      c.siteDraftReady({ previewUrl: 'https://preview.acme.com', tier: 'simple' });
      expect(c.getData().currentState).toBe(ProposalState.SITE_DRAFT_READY);

      c.draftProposal({ channel: 'email', draftContent: 'Hello...' });
      expect(c.getData().currentState).toBe(ProposalState.PROPOSAL_DRAFTED);

      c.approve({ approvedBy: 'admin' });
      expect(c.getData().currentState).toBe(ProposalState.PROPOSAL_APPROVED);

      c.send({ channel: 'email', sentAt: new Date().toISOString() });
      expect(c.getData().currentState).toBe(ProposalState.PROPOSAL_SENT);

      c.respond({ responseContent: 'Interested', responseChannel: 'email' });
      expect(c.getData().currentState).toBe(ProposalState.RESPONDED);

      c.markWon({ dealValue: 5000 });
      expect(c.getData().currentState).toBe(ProposalState.WON);
    });

    it('records one event per transition', () => {
      const c = ProposalCase.discover(basePayload);
      c.markEnriched({ contactEmail: 'a@b.com', siteOutdated: false });
      c.qualify({ reason: 'good fit' });
      c.startSiteBuild({ tier: 'simple' });
      c.siteDraftReady({ previewUrl: 'x', tier: 'simple' });
      c.draftProposal({ channel: 'email', draftContent: 'x' });
      c.approve({ approvedBy: 'me' });
      c.send({ channel: 'email', sentAt: 'now' });
      c.respond({ responseContent: 'ok', responseChannel: 'email' });
      c.markWon({ dealValue: 100 });

      expect(c.getEvents()).toHaveLength(10);
      const types = c.getEvents().map((e) => e.eventType);
      expect(types).toEqual([
        ProposalEventType.DISCOVERED,
        ProposalEventType.ENRICHED,
        ProposalEventType.QUALIFIED,
        ProposalEventType.SITE_DRAFT_BUILDING,
        ProposalEventType.SITE_DRAFT_READY,
        ProposalEventType.PROPOSAL_DRAFTED,
        ProposalEventType.PROPOSAL_APPROVED,
        ProposalEventType.PROPOSAL_SENT,
        ProposalEventType.RESPONDED,
        ProposalEventType.WON,
      ]);
    });
  });

  describe('full happy path to LOST', () => {
    it('walks through to LOST from RESPONDED', () => {
      const c = ProposalCase.discover(basePayload);
      c.markEnriched({ contactEmail: 'a@b.com', siteOutdated: false });
      c.qualify({ reason: 'fit' });
      c.startSiteBuild({ tier: 'complex' });
      c.siteDraftReady({ previewUrl: 'x', tier: 'complex' });
      c.draftProposal({ channel: 'sms', draftContent: 'Hi' });
      c.approve({ approvedBy: 'auto' });
      c.send({ channel: 'sms', sentAt: 'now' });
      c.respond({ responseContent: 'No thanks', responseChannel: 'sms' });
      c.markLost({ reason: 'not interested' });

      expect(c.getData().currentState).toBe(ProposalState.LOST);
    });
  });

  describe('stale transitions', () => {
    const activeStates = [
      ProposalState.DISCOVERED,
      ProposalState.ENRICHED,
      ProposalState.QUALIFIED,
      ProposalState.SITE_DRAFT_BUILDING,
      ProposalState.SITE_DRAFT_READY,
      ProposalState.PROPOSAL_DRAFTED,
      ProposalState.PROPOSAL_APPROVED,
      ProposalState.PROPOSAL_SENT,
      ProposalState.RESPONDED,
    ];

    for (const state of activeStates) {
      it(`can go STALE from ${state}`, () => {
        const c = ProposalCase.discover(basePayload);
        const steps = getStepsTo(state);
        for (const fn of steps) fn(c);
        expect(c.getData().currentState).toBe(state);

        c.markStale({ reason: 'timeout' });
        expect(c.getData().currentState).toBe(ProposalState.STALE);
      });
    }

    it('records previousState in stale payload', () => {
      const c = ProposalCase.discover(basePayload);
      c.markEnriched({ contactEmail: 'a@b.com', siteOutdated: false });
      c.qualify({ reason: 'ok' });
      c.markStale();
      const events = c.getEvents();
      const staleEvent = events.find((e) => e.eventType === ProposalEventType.STALE);
      expect(staleEvent?.payload).toMatchObject({ previousState: ProposalState.QUALIFIED });
    });

    it('markStale with empty args fills in previousState', () => {
      const c = ProposalCase.discover(basePayload);
      c.markStale();
      const events = c.getEvents();
      expect(events[events.length - 1].payload).toMatchObject({
        previousState: ProposalState.DISCOVERED,
      });
    });
  });

  describe('invalid transitions', () => {
    it('rejects skipping a state', () => {
      const c = ProposalCase.discover(basePayload);
      expect(() => c.qualify({ reason: 'skip' })).toThrow(/Invalid transition/);
    });

    it('rejects transitioning from the wrong state', () => {
      const c = ProposalCase.discover(basePayload);
      c.markEnriched({ contactEmail: 'a@b.com', siteOutdated: false });
      expect(() => c.startSiteBuild({ tier: 'simple' })).toThrow(/Invalid transition/);
    });

    it('rejects DISCOVERED → PROPOSAL_DRAFTED directly', () => {
      const c = ProposalCase.discover(basePayload);
      expect(() => c.draftProposal({ channel: 'email', draftContent: 'nope' })).toThrow(/Invalid transition/);
    });
  });

  describe('terminal state enforcement', () => {
    it('rejects any transition from WON', () => {
      const c = walkTo(ProposalState.WON);
      expect(() => c.markEnriched({ contactEmail: 'a@b.com', siteOutdated: false })).toThrow(/Invalid transition/);
      expect(() => c.qualify({ reason: 'x' })).toThrow(/Invalid transition/);
      expect(() => c.startSiteBuild({ tier: 'simple' })).toThrow(/Invalid transition/);
      expect(() => c.siteDraftReady({ previewUrl: 'x', tier: 'simple' })).toThrow(/Invalid transition/);
      expect(() => c.draftProposal({ channel: 'email', draftContent: 'x' })).toThrow(/Invalid transition/);
      expect(() => c.approve({ approvedBy: 'x' })).toThrow(/Invalid transition/);
      expect(() => c.send({ channel: 'email', sentAt: 'x' })).toThrow(/Invalid transition/);
      expect(() => c.respond({ responseContent: 'x', responseChannel: 'email' })).toThrow(/Invalid transition/);
      expect(() => c.markWon()).toThrow(/Invalid transition/);
      expect(() => c.markLost()).toThrow(/Invalid transition/);
      expect(() => c.markStale()).toThrow(/Invalid transition/);
    });

    it('rejects any transition from LOST', () => {
      const c = walkTo(ProposalState.LOST);
      expect(() => c.markEnriched({ contactEmail: 'a@b.com', siteOutdated: false })).toThrow(/Invalid transition/);
      expect(() => c.markWon()).toThrow(/Invalid transition/);
      expect(() => c.markStale()).toThrow(/Invalid transition/);
    });

    it('rejects any transition from STALE', () => {
      const c = walkTo(ProposalState.STALE);
      expect(() => c.markEnriched({ contactEmail: 'a@b.com', siteOutdated: false })).toThrow(/Invalid transition/);
      expect(() => c.markWon()).toThrow(/Invalid transition/);
      expect(() => c.markLost()).toThrow(/Invalid transition/);
    });
  });

  describe('load (rehydration)', () => {
    it('restores exact state from ProposalCaseData', () => {
      const original = ProposalCase.discover(basePayload);
      original.markEnriched({ contactEmail: 'test@test.com', siteOutdated: true, techStack: ['node'] });
      const data = original.getData();

      const loaded = ProposalCase.load(data);
      expect(loaded.getData()).toEqual(data);
      expect(loaded.getData().currentState).toBe(ProposalState.ENRICHED);
    });

    it('loaded case starts with zero events', () => {
      const original = ProposalCase.discover(basePayload);
      const loaded = ProposalCase.load(original.getData());
      expect(loaded.getEvents()).toHaveLength(0);
    });

    it('loaded case can continue transitions', () => {
      const original = ProposalCase.discover(basePayload);
      original.markEnriched({ contactEmail: 'a@b.com', siteOutdated: false });
      const loaded = ProposalCase.load(original.getData());

      loaded.qualify({ reason: 'good' });
      expect(loaded.getData().currentState).toBe(ProposalState.QUALIFIED);
      expect(loaded.getEvents()).toHaveLength(1);
      expect(loaded.getEvents()[0].eventType).toBe(ProposalEventType.QUALIFIED);
    });
  });

  describe('event drain', () => {
    it('drainEvents returns and clears events', () => {
      const c = ProposalCase.discover(basePayload);
      c.markEnriched({ contactEmail: 'a@b.com', siteOutdated: false });

      const drained = c.drainEvents();
      expect(drained).toHaveLength(2);
      expect(c.getEvents()).toHaveLength(0);
    });

    it('drainEvents is idempotent after drain', () => {
      const c = ProposalCase.discover(basePayload);
      c.drainEvents();
      expect(c.drainEvents()).toHaveLength(0);
    });
  });

  describe('event structure', () => {
    it('each event has eventId, aggregateId, occurredAt', () => {
      const c = ProposalCase.discover(basePayload);
      const ev = c.getEvents()[0];
      expect(ev.eventId).toBeTruthy();
      expect(ev.aggregateId).toBe(c.getData().id);
      expect(ev.occurredAt).toBeTruthy();
      expect(() => new Date(ev.occurredAt)).not.toThrow();
    });

    it('all events share the same aggregateId', () => {
      const c = ProposalCase.discover(basePayload);
      c.markEnriched({ contactEmail: 'a@b.com', siteOutdated: false });
      c.qualify({ reason: 'fit' });
      const ids = c.getEvents().map((e) => e.aggregateId);
      expect(new Set(ids).size).toBe(1);
    });
  });

  describe('data integrity', () => {
    it('getData returns a copy, not a reference', () => {
      const c = ProposalCase.discover(basePayload);
      const d = c.getData();
      d.companyName = 'Hacked';
      expect(c.getData().companyName).toBe('Acme Corp');
    });

    it('getEvents returns a copy', () => {
      const c = ProposalCase.discover(basePayload);
      const events = c.getEvents();
      events.length = 0;
      expect(c.getEvents()).toHaveLength(1);
    });

    it('has valid timestamps on all data', () => {
      const c = ProposalCase.discover(basePayload);
      c.markEnriched({ contactEmail: 'a@b.com', siteOutdated: false });
      const d = c.getData();
      expect(() => new Date(d.createdAt)).not.toThrow();
      expect(() => new Date(d.updatedAt)).not.toThrow();
      expect(new Date(d.updatedAt).getTime()).toBeGreaterThanOrEqual(new Date(d.createdAt).getTime());
    });
  });
});

// Helpers

type Step = (c: ProposalCase) => void;

function getStepsTo(target: ProposalState): Step[] {
  const map: Record<ProposalState, Step[]> = {
    [ProposalState.DISCOVERED]: [],
    [ProposalState.ENRICHED]: [
      (c) => c.markEnriched({ contactEmail: 'e@b.com', siteOutdated: false }),
    ],
    [ProposalState.QUALIFIED]: [
      (c) => c.markEnriched({ contactEmail: 'e@b.com', siteOutdated: false }),
      (c) => c.qualify({ reason: 'fit' }),
    ],
    [ProposalState.SITE_DRAFT_BUILDING]: [
      (c) => c.markEnriched({ contactEmail: 'e@b.com', siteOutdated: false }),
      (c) => c.qualify({ reason: 'fit' }),
      (c) => c.startSiteBuild({ tier: 'simple' }),
    ],
    [ProposalState.SITE_DRAFT_READY]: [
      (c) => c.markEnriched({ contactEmail: 'e@b.com', siteOutdated: false }),
      (c) => c.qualify({ reason: 'fit' }),
      (c) => c.startSiteBuild({ tier: 'simple' }),
      (c) => c.siteDraftReady({ previewUrl: 'x', tier: 'simple' }),
    ],
    [ProposalState.PROPOSAL_DRAFTED]: [
      (c) => c.markEnriched({ contactEmail: 'e@b.com', siteOutdated: false }),
      (c) => c.qualify({ reason: 'fit' }),
      (c) => c.startSiteBuild({ tier: 'simple' }),
      (c) => c.siteDraftReady({ previewUrl: 'x', tier: 'simple' }),
      (c) => c.draftProposal({ channel: 'email', draftContent: 'x' }),
    ],
    [ProposalState.PROPOSAL_APPROVED]: [
      (c) => c.markEnriched({ contactEmail: 'e@b.com', siteOutdated: false }),
      (c) => c.qualify({ reason: 'fit' }),
      (c) => c.startSiteBuild({ tier: 'simple' }),
      (c) => c.siteDraftReady({ previewUrl: 'x', tier: 'simple' }),
      (c) => c.draftProposal({ channel: 'email', draftContent: 'x' }),
      (c) => c.approve({ approvedBy: 'admin' }),
    ],
    [ProposalState.PROPOSAL_SENT]: [
      (c) => c.markEnriched({ contactEmail: 'e@b.com', siteOutdated: false }),
      (c) => c.qualify({ reason: 'fit' }),
      (c) => c.startSiteBuild({ tier: 'simple' }),
      (c) => c.siteDraftReady({ previewUrl: 'x', tier: 'simple' }),
      (c) => c.draftProposal({ channel: 'email', draftContent: 'x' }),
      (c) => c.approve({ approvedBy: 'admin' }),
      (c) => c.send({ channel: 'email', sentAt: 'now' }),
    ],
    [ProposalState.RESPONDED]: [
      (c) => c.markEnriched({ contactEmail: 'e@b.com', siteOutdated: false }),
      (c) => c.qualify({ reason: 'fit' }),
      (c) => c.startSiteBuild({ tier: 'simple' }),
      (c) => c.siteDraftReady({ previewUrl: 'x', tier: 'simple' }),
      (c) => c.draftProposal({ channel: 'email', draftContent: 'x' }),
      (c) => c.approve({ approvedBy: 'admin' }),
      (c) => c.send({ channel: 'email', sentAt: 'now' }),
      (c) => c.respond({ responseContent: 'ok', responseChannel: 'email' }),
    ],
    [ProposalState.WON]: [
      (c) => c.markEnriched({ contactEmail: 'e@b.com', siteOutdated: false }),
      (c) => c.qualify({ reason: 'fit' }),
      (c) => c.startSiteBuild({ tier: 'simple' }),
      (c) => c.siteDraftReady({ previewUrl: 'x', tier: 'simple' }),
      (c) => c.draftProposal({ channel: 'email', draftContent: 'x' }),
      (c) => c.approve({ approvedBy: 'admin' }),
      (c) => c.send({ channel: 'email', sentAt: 'now' }),
      (c) => c.respond({ responseContent: 'ok', responseChannel: 'email' }),
      (c) => c.markWon({ dealValue: 100 }),
    ],
    [ProposalState.LOST]: [
      (c) => c.markEnriched({ contactEmail: 'e@b.com', siteOutdated: false }),
      (c) => c.qualify({ reason: 'fit' }),
      (c) => c.startSiteBuild({ tier: 'simple' }),
      (c) => c.siteDraftReady({ previewUrl: 'x', tier: 'simple' }),
      (c) => c.draftProposal({ channel: 'email', draftContent: 'x' }),
      (c) => c.approve({ approvedBy: 'admin' }),
      (c) => c.send({ channel: 'email', sentAt: 'now' }),
      (c) => c.respond({ responseContent: 'no', responseChannel: 'email' }),
      (c) => c.markLost({ reason: 'not interested' }),
    ],
    [ProposalState.STALE]: [
      (c) => c.markEnriched({ contactEmail: 'e@b.com', siteOutdated: false }),
      (c) => c.qualify({ reason: 'fit' }),
      (c) => c.markStale({ reason: 'timeout' }),
    ],
  };
  return map[target];
}

function walkTo(target: ProposalState): ProposalCase {
  const c = ProposalCase.discover({
    companyName: 'Test',
    source: 'test',
  });
  const steps = getStepsTo(target);
  for (const fn of steps) fn(c);
  return c;
}
