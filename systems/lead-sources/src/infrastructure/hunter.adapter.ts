import { LeadResult } from '../domain/types';
import { EnrichmentProvider, isConfigured } from '../application/ports';

const source = {
  id: 'hunter' as const,
  name: 'Hunter.io',
  description: 'Find professional email addresses for any company domain.',
  icon: 'H',
  configured: false,
  needsKey: ['HUNTER_API_KEY'],
};

export class HunterAdapter implements EnrichmentProvider {
  readonly source: typeof source;

  constructor(private readonly apiKey?: string) {
    this.source = { ...source, configured: isConfigured({ HUNTER_API_KEY: apiKey }, ['HUNTER_API_KEY']) };
  }

  async enrich(lead: LeadResult): Promise<Partial<LeadResult>> {
    if (!this.apiKey || !lead.website) return {};
    const domain = domainOf(lead.website);
    if (!domain) return {};

    const url = new URL('https://api.hunter.io/v2/domain-search');
    url.searchParams.set('domain', domain);
    url.searchParams.set('api_key', this.apiKey);
    url.searchParams.set('limit', '3');

    try {
      const res = await fetch(url.toString());
      if (!res.ok) return {};
      const data = await res.json();
      const domainData = data?.data;
      if (!domainData) return {};

      const emails = (domainData.emails ?? []).map((e: any) => e.value);
      const org = domainData.organization;
      const titles = (domainData.people ?? []).map((p: any) => p.first_name).slice(0, 5);

      return {
        email: emails[0],
        name: lead.name || org,
        titles,
        employees: domainData.employees_count || undefined,
        industry: domainData.industry || lead.industry,
      };
    } catch {
      return {};
    }
  }
}

function domainOf(website: string): string | null {
  try {
    return new URL(website).hostname.replace(/^www\./, '');
  } catch {
    return website.replace(/^www\./, '');
  }
}
