import { NextResponse } from 'next/server';
import { getLeadSearchService } from '@/lib/lead-search';

export async function GET() {
  const service = getLeadSearchService();
  const sources = service.listSources().map((s) => ({
    id: s.id,
    name: s.name,
    description: s.description,
    icon: s.icon,
    configured: s.configured,
    needsKey: s.needsKey,
  }));

  return NextResponse.json({ sources });
}