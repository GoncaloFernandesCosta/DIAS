import { LeadSearchParams, LeadResult } from '../domain/types';
import { LeadSearchProvider, isConfigured } from '../application/ports';

const source = {
  id: 'crunchbase' as const,
  name: 'Crunchbase',
  description: 'Experience-backed company data: funding, employees, founders and flagship products.',
  icon: 'C',
  configured: false,
  needsKey: ['CRUNCHBASE_API_KEY'],
};

export class CrunchbaseAdapter implements LeadSearchProvider {
  readonly source: typeof source;

  constructor(private readonly apiKey?: string) {
    this.source = { ...source, configured: isConfigured({ CRUNCHBASE_API_KEY: apiKey }, ['CRUNCHBASE_API_KEY']) };
  }

  async search(params: LeadSearchParams): Promise<LeadResult[]> {
    if (!this.apiKey) return [];

    const url = new URL('https://api.crunchbase.com/api/v4/searches/organizations');
    const body = {
      query: params.query,
      limit: params.limit ?? 25,
      fields: ['name', 'website_url', 'short_description', 'founded_on', 'address', 'rank_org', 'num_employees_max'],
    };

    const res = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-cb-user-key': this.apiKey,
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Crunchbase error ${res.status}`);
    const data = await res.json();

    return (data.entities ?? []).map((entity: any) => {
      const props = entity.properties ?? {};
      return {
        id: entity.uuid || props.name,
        name: props.name,
        description: props.short_description || undefined,
        website: props.website_url?.value || props.website_url || undefined,
        founded: props.founded_on ? new Date(props.founded_on).getFullYear() : undefined,
        employees: props.num_employees_max || undefined,
        location: addressToString(props.address) || params.location,
        source: 'crunchbase' as const,
      };
    });
  }
}

function addressToString(address: any): string | undefined {
  if (!address) return undefined;
  const parts = [
    address.city,
    address.country_name || address.country,
  ].filter(Boolean);
  return parts.length ? parts.join(', ') : undefined;
}