import { LeadSearchParams, LeadResult } from '../domain/types';
import { LeadSearchProvider, isConfigured } from '../application/ports';

const source = {
  id: 'google-places' as const,
  name: 'Google Places',
  description: 'Search businesses by category, location and keywords via the Google Places API.',
  icon: 'G',
  configured: false,
  needsKey: ['GOOGLE_PLACES_API_KEY'],
};

export class GooglePlacesAdapter implements LeadSearchProvider {
  readonly source: typeof source;

  constructor(private readonly apiKey?: string) {
    this.source = { ...source, configured: isConfigured({ GOOGLE_PLACES_API_KEY: apiKey }, ['GOOGLE_PLACES_API_KEY']) };
  }

  async search(params: LeadSearchParams): Promise<LeadResult[]> {
    if (!this.apiKey) return [];

    const query = buildQuery(params);
    const url = new URL('https://maps.googleapis.com/maps/api/place/textsearch/json');
    url.searchParams.set('query', query);
    url.searchParams.set('key', this.apiKey);

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Google Places error ${res.status}`);
    const data = await res.json();
    if (data.status && data.status !== 'OK') {
      if (data.status === 'ZERO_RESULTS') return [];
      throw new Error(`Google Places: ${data.status}`);
    }

    return (data.results ?? []).map((place: any) => ({
      id: place.place_id,
      name: place.name,
      address: place.formatted_address,
      description: (place.types ?? []).slice(0, 3).join(', ') || undefined,
      location: place.formatted_address,
      industry: (place.types ?? []).find((t: string) => !t.startsWith('point')) || params.industry,
      rating: place.rating,
      reviewCount: place.user_ratings_total,
      website: place.website || undefined,
      phone: place.international_phone_number || undefined,
      source: 'google-places' as const,
    }));
  }
}

function buildQuery(params: LeadSearchParams): string {
  const parts: string[] = [];
  if (params.query) parts.push(params.query);
  if (params.location) parts.push(params.location);
  if (params.industry) parts.push(params.industry);
  return parts.join(' ') || 'businesses';
}
