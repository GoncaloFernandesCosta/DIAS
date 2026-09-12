import { LeadSearchParams, LeadResult } from '../domain/types';
import { LeadSearchProvider, isConfigured } from '../application/ports';

const source = {
  id: 'serp' as const,
  name: 'Google Search',
  description: 'Google SERP results via SerpAPI — find businesses that rank but lack a modern web presence.',
  icon: 'S',
  configured: false,
  needsKey: ['SERP_API_KEY'],
};

export class SerpAdapter implements LeadSearchProvider {
  readonly source: typeof source;

  constructor(private readonly apiKey?: string) {
    this.source = { ...source, configured: isConfigured({ SERP_API_KEY: apiKey }, ['SERP_API_KEY']) };
  }

  async search(params: LeadSearchParams): Promise<LeadResult[]> {
    if (!this.apiKey) return [];

    const query = [params.query, params.location, params.industry].filter(Boolean).join(' ');
    const url = new URL('https://serpapi.com/search.json');
    url.searchParams.set('q', `${query} site:facebook.com OR site:linkedin.com`);
    url.searchParams.set('engine', 'google');
    url.searchParams.set('api_key', this.apiKey);
    url.searchParams.set('num', String(params.limit ?? 25));
    url.searchParams.set('hl', 'en');

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`SerpAPI error ${res.status}`);
    const data = await res.json();

    return (data.organic_results ?? []).map((result: any, index: number) => ({
      id: result.rank || `serp-${index}`,
      name: cleanName(result.title) || params.query,
      description: result.snippet || undefined,
      website: result.link || undefined,
      industry: params.industry,
      location: params.location,
      source: 'serp' as const,
    }));
  }
}

function cleanName(title: string): string {
  if (!title) return '';
  const withoutBrand = title
    .replace(/\s*[-|–]\s*.+$/i, '')
    .replace(/\s*facebook\s*$/i, '')
    .replace(/\s*linkedin\s*$/i, '')
    .trim();
  return withoutBrand;
}