import { NextRequest, NextResponse } from 'next/server';
import { getLeadSearchService } from '@/lib/lead-search';
import type { LeadSearchParams, LeadSourceId } from '@dias/lead-sources';

export async function POST(request: NextRequest) {
  try {
    const body: {
      query?: string;
      location?: string;
      industry?: string;
      limit?: number;
      country?: string;
      sources?: LeadSourceId[];
    } = await request.json().catch(() => ({}));

    const query = (body.query ?? '').trim();
    if (!query) {
      return NextResponse.json({ error: 'A search query is required.' }, { status: 400 });
    }

    const service = getLeadSearchService();
    const params: LeadSearchParams = {
      query,
      location: body.location?.trim() || undefined,
      industry: body.industry?.trim() || undefined,
      limit: Math.min(Math.max(body.limit ?? 50, 1), 200),
      country: body.country?.trim() || undefined,
    };

    const summary = await service.search(params, body.sources);

    return NextResponse.json(summary);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Search failed' },
      { status: 500 },
    );
  }
}