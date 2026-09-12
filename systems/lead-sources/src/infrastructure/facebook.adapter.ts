import { LeadSearchParams, LeadResult } from '../domain/types';
import { LeadSearchProvider, isConfigured } from '../application/ports';

const source = {
  id: 'facebook' as const,
  name: 'Facebook / Meta',
  description: 'Find businesses, pages and local listings through the Meta Graph API.',
  icon: 'F',
  configured: false,
  needsKey: ['FACEBOOK_ACCESS_TOKEN'],
};

export class FacebookAdapter implements LeadSearchProvider {
  readonly source: typeof source;

  constructor(private readonly accessToken?: string) {
    this.source = { ...source, configured: isConfigured({ FACEBOOK_ACCESS_TOKEN: accessToken }, ['FACEBOOK_ACCESS_TOKEN']) };
  }

  async search(params: LeadSearchParams): Promise<LeadResult[]> {
    if (!this.accessToken) return [];

    const url = new URL('https://graph.facebook.com/v18.0/search');
    url.searchParams.set('q', params.query);
    url.searchParams.set('type', 'page');
    url.searchParams.set('access_token', this.accessToken);
    if (params.limit) url.searchParams.set('limit', String(params.limit));
    if (params.country) url.searchParams.set('country', params.country);

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Facebook error ${res.status}`);
    const data = await res.json();

    return (data.data ?? []).map((page: any) => ({
      id: page.id,
      name: page.name,
      social: { facebook: page.link || `https://www.facebook.com/${page.id}` },
      description: page.about || undefined,
      website: page.website ? firstUrl(page.website) : undefined,
      location: page.location?.city
        ? [page.location.city, page.location.country].filter(Boolean).join(', ')
        : params.location,
      industry: page.category || params.industry,
      phone: page.phone || undefined,
      source: 'facebook' as const,
    }));
  }
}

function firstUrl(value: string): string | undefined {
  const match = value.split(/\s+/).find((part) => part.startsWith('http'));
  return match;
}
