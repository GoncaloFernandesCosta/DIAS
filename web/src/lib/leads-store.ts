import { promises as fs } from 'node:fs';
import { join } from 'node:path';
import { LeadResult } from '@dias/lead-sources';
import { SavedLead } from '@/types';
import { getDataDir } from '@/lib/data-dir';

const DATA_FILE = join(getDataDir(), 'web-leads.json');

async function readAll(): Promise<SavedLead[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(raw) as SavedLead[];
  } catch {
    return [];
  }
}

async function writeAll(leads: SavedLead[]): Promise<void> {
  await fs.mkdir(getDataDir(), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(leads, null, 2), 'utf8');
}

export async function listLeads(): Promise<SavedLead[]> {
  return readAll();
}

export async function getLead(id: string): Promise<SavedLead | undefined> {
  const leads = await readAll();
  return leads.find((l) => l.id === id);
}

export async function saveLead(lead: LeadResult): Promise<SavedLead> {
  const leads = await readAll();
  const existing = leads.find(
    (l) => l.website && lead.website && normalizeDomain(l.website) === normalizeDomain(lead.website),
  );
  if (existing) return existing;

  const saved: SavedLead = {
    ...lead,
    id: `lead-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    savedAt: new Date().toISOString(),
    status: 'new',
  };

  leads.push(saved);
  await writeAll(leads);
  return saved;
}

export async function updateLeadStatus(id: string, status: SavedLead['status']): Promise<SavedLead | undefined> {
  const leads = await readAll();
  const lead = leads.find((l) => l.id === id);
  if (!lead) return undefined;
  lead.status = status;
  lead.note = lead.note ?? '';
  await writeAll(leads);
  return lead;
}

export async function updateLeadNote(id: string, note: string): Promise<SavedLead | undefined> {
  const leads = await readAll();
  const lead = leads.find((l) => l.id === id);
  if (!lead) return undefined;
  lead.note = note;
  await writeAll(leads);
  return lead;
}

export async function deleteLead(id: string): Promise<boolean> {
  const leads = await readAll();
  const next = leads.filter((l) => l.id !== id);
  if (next.length === leads.length) return false;
  await writeAll(next);
  return true;
}

export async function clearLeads(): Promise<void> {
  await writeAll([]);
}

export async function stats(leads?: SavedLead[]): Promise<{
  total: number;
  newLeads: number;
  contacted: number;
  responded: number;
  won: number;
  lost: number;
  contactRate: number;
  winRate: number;
}> {
  const all = leads ?? (await listLeads());
  const contacted = all.filter((l) =>
    ['contacted', 'responded', 'won'].includes(l.status),
  ).length;
  const responded = all.filter((l) => l.status === 'responded').length;
  const won = all.filter((l) => l.status === 'won').length;
  const lost = all.filter((l) => l.status === 'lost').length;

  return {
    total: all.length,
    newLeads: all.filter((l) => l.status === 'new').length,
    contacted,
    responded,
    won,
    lost,
    contactRate: all.length ? Math.round((contacted / all.length) * 100) : 0,
    winRate: all.length ? Math.round((won / all.length) * 100) : 0,
  };
}

function normalizeDomain(website: string): string {
  try {
    return new URL(website).hostname.replace(/^www\./, '');
  } catch {
    return website.replace(/^www\./, '').replace(/\/+$/, '');
  }
}