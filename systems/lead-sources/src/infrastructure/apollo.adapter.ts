import { LeadSearchParams, LeadResult } from '../domain/types';
import { LeadSearchProvider, isConfigured } from '../application/ports';

const source = {
  id: 'apollo' as const,
  name: 'Apollo.io',
  description: 'B2B contact and company database with rich firmographic data.',
  icon: 'A',
  configured: false,
  needsKey: ['APOLLO_API_KEY'],
};

export class ApolloAdapter implements LeadSearchProvider {
  readonly source: typeof source;

  constructor(private readonly apiKey?: string) {
    this.source = { ...source, configured: isConfigured({ APOLLO_API_KEY: apiKey }, ['APOLLO_API_KEY']) };
  }

  async search(params: LeadSearchParams): Promise<LeadResult[]> {
    if (!this.apiKey) return [];

    const url = new URL('https://api.apollo.io/api/v1/mixed_people/search');
    const body: Record<string, unknown> = {
      q_keywords: params.query,
      per_page: params.limit ?? 25,
    };
    if (params.industry) {
      const res = await resolveIndustry(this.apiKey, params.industry);
      if (res) body.industry = [res];
    }

    const res = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Apollo error ${res.status}`);
    const data = await res.json();

    return (data.people ?? []).map((person: any) => ({
      id: person.id || `${person.name}-${person.organization?.name}`,
      name: person.organization?.name || person.name,
      description: person.organization?.website_url || undefined,
      website: person.organization?.website_url || undefined,
      email: person.email || undefined,
      phone: person.phone || undefined,
      titles: person.title ? [person.title] : undefined,
      industry: person.organization?.industry || params.industry,
      location: person.city || undefined,
      founded: person.organization?.founded_year || undefined,
      employees: person.organization?.estimated_num_employees || undefined,
      social: {
        linkedin: person.linkedin_url || person.organization?.linkedin_url || undefined,
      },
      source: 'apollo' as const,
    }));
  }
}

async function resolveIndustry(apiKey: string, industry: string): Promise<string | null> {
  try {
    const url = new URL('https://api.apollo.io/api/v1/industries');
    const res = await fetch(url.toString(), { headers: { 'x-api-key': apiKey } });
    if (!res.ok) return null;
    const data = await res.json();
    const found = (data.industries ?? []).find((i: any) =>
      i.name.toLowerCase().includes(industry.toLowerCase()),
    );
    return found?.id ?? null;
  } catch {
    return null;
  }
}
