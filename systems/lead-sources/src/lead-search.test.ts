import { describe, it, expect } from 'vitest';
import { DemoSearchAdapter } from './infrastructure/demo.adapter';
import { LeadSearchService } from './application/lead-search-service';
import type { LeadSearchProvider, EnrichmentProvider } from './application/ports';

describe('DemoSearchAdapter', () => {
  const adapter = new DemoSearchAdapter();

  it('is always configured', () => {
    expect(adapter.source.configured).toBe(true);
  });

  it('filters by query and location', async () => {
    const results = await adapter.search({ query: 'restaurant', location: 'Lisbon' });
    expect(results.length).toBeGreaterThan(0);
    for (const r of results) {
      expect(r.location).toMatch(/lisbon/i);
    }
  });

  it('filters by industry', async () => {
    const results = await adapter.search({ query: 'auto', industry: 'automotive' });
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('Garagem Auto');
  });

  it('returns empty for no matches', async () => {
    const results = await adapter.search({ query: 'zzz-no-such-business' });
    expect(results).toHaveLength(0);
  });
});

describe('LeadSearchService', () => {
  const good: LeadSearchProvider = {
    source: {
      id: 'serp',
      name: 'Fake',
      description: '',
      icon: '',
      configured: true,
      needsKey: [],
    },
    async search() {
      return [
        {
          id: 'a',
          name: 'Acme Corp',
          website: 'https://acme.com',
          source: 'serp',
          email: 'x@acme.com',
        },
        {
          id: 'b',
          name: 'Acme Ltd',
          website: 'https://acme.com',
          source: 'serp',
          phone: '+1 555',
        },
      ];
    },
  };

  const bad: LeadSearchProvider = {
    source: {
      id: 'crunchbase',
      name: 'Fake',
      description: '',
      icon: '',
      configured: true,
      needsKey: [],
    },
    async search() {
      throw new Error('boom');
    },
  };

  const enricher: EnrichmentProvider = {
    source: { id: 'hunter', name: '', description: '', icon: '', configured: true, needsKey: [] },
    async enrich(lead) {
      return { titles: ['CEO'] };
    },
  };

  it('merges and deduplicates by domain', async () => {
    const service = new LeadSearchService({ providers: [good], enrichers: [] });
    const summary = await service.search({ query: 'acme' });
    expect(summary.total).toBe(1);
    expect(summary.results[0]).toMatchObject({
      email: 'x@acme.com',
      phone: '+1 555',
    });
  });

  it('skips failing providers without aborting', async () => {
    const service = new LeadSearchService({ providers: [good, bad], enrichers: [] });
    const summary = await service.search({ query: 'acme' });
    expect(summary.total).toBe(1);
    expect(summary.skipped).toHaveLength(1);
    expect(summary.skipped[0].source).toBe('crunchbase');
  });

  it('runs enrichment across configured enrichers', async () => {
    const service = new LeadSearchService({ providers: [good], enrichers: [enricher] });
    const summary = await service.search({ query: 'acme' });
    expect(summary.results[0].titles).toEqual(['CEO']);
  });
});