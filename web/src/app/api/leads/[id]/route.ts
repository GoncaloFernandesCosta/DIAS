import { NextRequest, NextResponse } from 'next/server';
import { updateLeadStatus, updateLeadNote, deleteLead, getLead } from '@/lib/leads-store';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const body: { status?: 'new' | 'contacted' | 'responded' | 'won' | 'lost'; note?: string } =
    await request.json().catch(() => ({}));

  const statuses = ['new', 'contacted', 'responded', 'won', 'lost'];
  if (body.status !== undefined && !statuses.includes(body.status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const lead = body.status !== undefined
    ? await updateLeadStatus(params.id, body.status as never)
    : body.note !== undefined
      ? await updateLeadNote(params.id, body.note)
      : await getLead(params.id);

  if (!lead) {
    return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
  }
  return NextResponse.json({ lead });
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  const ok = await deleteLead(params.id);
  if (!ok) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
  return NextResponse.json({ deleted: true });
}