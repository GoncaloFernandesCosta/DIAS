import { describe, it, expect } from 'vitest';
import { ProspectingService } from './application/prospecting-service';
import { LocalSearchAdapter } from './infrastructure/local-search-adapter';
import { StaticEnrichmentAdapter } from './infrastructure/static-enrichment-adapter';
import { EnrichmentProvider } from './application/ports';

function makeService() {
  return new ProspectingService(
    new LocalSearchAdapter(),
    new StaticEnrichmentAdapter(),
  );
}

describe('ProspectingService', () => {
  it('qualifies outdated sites and no-website companies', async () => {
    const service = makeService();
    const result = await service.runJob({ industry: 'restaurants', region: 'Lisbon' });

    expect(result.qualified).toBe(2);
    expect(result.disqualified).toBe(0);
    expect(result.prospects.map((p) => p.companyName)).toEqual([
      'Casa dos Sabores',
      'Marmitas do Bairro',
    ]);
  });

  it('disqualifies modern sites', async () => {
    const service = makeService();
    const result = await service.runJob({ industry: 'restaurants', region: 'Porto' });

    expect(result.qualified).toBe(0);
    expect(result.disqualified).toBe(1);
    expect(result.disqualifiedProspects[0].companyName).toBe('Tasca Moderna');
    expect(result.disqualifiedProspects[0].reason).toMatch(/modern/);
  });

  it('respects the limit option', async () => {
    const service = makeService();
    const result = await service.runJob({ industry: 'healthcare', limit: 1 });
    expect(result.searched).toBe(1);
  });

  it('enriches with contact email and tech stack', async () => {
    const service = makeService();
    const result = await service.runJob({ industry: 'printing' });
    const p = result.prospects[0];
    expect(p.contactEmail).toBe('contact@encadernacoes.pt');
    expect(p.siteOutdated).toBe(true);
    expect(p.techStack).toContain('php 4');
  });

  it('reports counts in the job result', async () => {
    const service = makeService();
    const result = await service.runJob({});
    expect(result.searched).toBeGreaterThanOrEqual(result.enriched);
    expect(result.qualified + result.disqualified).toBe(result.enriched);
  });

  it('uses custom qualification rules when provided', async () => {
    const service = new ProspectingService(
      new LocalSearchAdapter(),
      new StaticEnrichmentAdapter(),
      { qualifiesIfSiteOutdated: false, qualifiesIfNoWebsite: false },
    );
    const result = await service.runJob({ industry: 'restaurants', region: 'Lisbon' });
    expect(result.qualified).toBe(0);
  });

  it('stops qualifying when enrichment returns an outdated flag only', async () => {
    class CustomEnrichment implements EnrichmentProvider {
      async enrich() {
        return {
          companyName: 'Solo Biz',
          industry: 'retail',
          region: 'Lisbon',
          website: '',
          contactEmail: 'a@b.com',
          techStack: [],
          siteOutdated: true,
        };
      }
    }
    const service = new ProspectingService(new LocalSearchAdapter(), new CustomEnrichment());
    const result = await service.runJob({ limit: 1 });
    expect(result.qualified).toBe(1);
  });
});
