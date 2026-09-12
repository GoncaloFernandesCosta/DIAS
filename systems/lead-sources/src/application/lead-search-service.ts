import {
  LeadSearchParams,
  LeadResult,
  LeadSearchSummary,
  LeadSource,
  LeadSourceId,
} from '../domain/types';
import { LeadSearchProvider, EnrichmentProvider } from './ports';

export interface LeadSearchDeps {
  providers: LeadSearchProvider[];
  enrichers: EnrichmentProvider[];
}

export class LeadSearchService {
  constructor(private readonly deps: LeadSearchDeps) {}

  listSources(): LeadSource[] {
    return this.deps.providers.map((p) => p.source);
  }

  getProvider(id: string): LeadSearchProvider | undefined {
    return this.deps.providers.find((p) => p.source.id === id);
  }

  async search(params: LeadSearchParams, sourceIds?: string[]): Promise<LeadSearchSummary> {
    const targets = sourceIds && sourceIds.length > 0
      ? this.deps.providers.filter((p) => sourceIds.includes(p.source.id))
      : this.deps.providers;

    const searched: LeadSourceId[] = [];
    const skipped: Array<{ source: LeadSourceId; reason: string }> = [];
    const bySource: Record<string, number> = {};

    const batches: LeadResult[][] = await Promise.all(
      targets.map(async (provider) => {
        if (!provider.source.configured) {
          skipped.push({
            source: provider.source.id,
            reason: 'Not configured (missing API key)',
          });
          return [];
        }
        try {
          const results = await provider.search(params);
          searched.push(provider.source.id);
          bySource[provider.source.id] = results.length;
          return results;
        } catch (error) {
          skipped.push({
            source: provider.source.id,
            reason: error instanceof Error ? error.message : String(error),
          });
          return [];
        }
      }),
    );

    const all = batches.flat();
    const merged = this.mergeLeads(all);

    if (this.deps.enrichers.length > 0) {
      await Promise.all(
        merged.map(async (lead) => {
          for (const enricher of this.deps.enrichers) {
            if (!enricher.source.configured || enricher.source.id === lead.source) continue;
            try {
              const partial = await enricher.enrich(lead);
              Object.assign(lead, partial);
            } catch {
              // enrichment is best-effort
            }
          }
        }),
      );
    }

    return {
      query: params,
      searched,
      total: merged.length,
      results: merged.slice(0, params.limit ?? merged.length),
      bySource,
      skipped,
    };
  }

  private mergeLeads(leads: LeadResult[]): LeadResult[] {
    const byDomain = new Map<string, LeadResult>();
    const others: LeadResult[] = [];

    const domainOf = (lead: LeadResult): string | null => {
      if (!lead.website) return null;
      try {
        return new URL(lead.website).hostname.replace(/^www\./, '');
      } catch {
        return lead.website.replace(/^www\./, '');
      }
    };

    for (const lead of leads) {
      const domain = domainOf(lead);
      if (!domain) {
        others.push(lead);
        continue;
      }
      const existing = byDomain.get(domain);
      if (!existing) {
        byDomain.set(domain, lead);
      } else {
        const merged = this.mergeTwo(existing, lead);
        byDomain.set(domain, merged);
      }
    }

    return [...byDomain.values(), ...others];
  }

  private mergeTwo(a: LeadResult, b: LeadResult): LeadResult {
    return {
      ...a,
      name: a.name || b.name,
      description: a.description || b.description,
      website: a.website || b.website,
      address: a.address || b.address,
      phone: a.phone || b.phone,
      email: a.email || b.email,
      industry: a.industry || b.industry,
      location: a.location || b.location,
      founded: a.founded ?? b.founded,
      employees: a.employees ?? b.employees,
      fundingTotal: a.fundingTotal ?? b.fundingTotal,
      rating: a.rating ?? b.rating,
      techStack: Array.from(new Set([...(a.techStack ?? []), ...(b.techStack ?? [])])),
      titles: Array.from(new Set([...(a.titles ?? []), ...(b.titles ?? [])])),
      social: { ...a.social, ...b.social },
    };
  }
}
