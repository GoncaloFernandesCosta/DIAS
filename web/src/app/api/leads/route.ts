import { NextRequest, NextResponse } from 'next/server';
import { listLeads, saveLead, stats, clearLeads } from '@/lib/leads-store';
import type { LeadResult } from '@dias/lead-sources';

export async function GET() {
  const leads = await listLeads();
  const leadStats = await stats(leads);
  return NextResponse.json({ leads, stats: leadStats });
}

export async function POST(request: NextRequest) {
  try {
    const body: Partial<LeadResult> = await request.json().catch(() => ({}));
    if (!body.name) {
      return NextResponse.json({ error: 'A lead name is required.' }, { status: 400 });
    }

    const saved = await saveLead(body as LeadResult);
    const leadStats = await stats();
    return NextResponse.json({ lead: saved, stats: leadStats }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save lead' },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  await clearLeads();
  return NextResponse.json({ cleared: true });
}