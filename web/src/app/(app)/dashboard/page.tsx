'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { SavedLead, LeadStatus } from '@/types';
import { api } from '@/lib/api';
import Badge from '@/components/ui/Badge';

interface DashboardData {
  leads: SavedLead[];
  stats: {
    total: number;
    newLeads: number;
    contacted: number;
    responded: number;
    won: number;
    lost: number;
    contactRate: number;
    winRate: number;
  };
}

const STATUS_LABEL: Record<LeadStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  responded: 'Responded',
  won: 'Won',
  lost: 'Lost',
};

const STATUS_VARIANT: Record<LeadStatus, 'info' | 'warning' | 'success' | 'danger' | 'default'> = {
  new: 'info',
  contacted: 'warning',
  responded: 'success',
  won: 'success',
  lost: 'danger',
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<LeadStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      const res = await api<DashboardData>('/api/leads');
      setData(res);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load leads');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function updateStatus(lead: SavedLead, next: LeadStatus) {
    const current = data?.leads ?? [];
    setData((d) =>
      d
        ? { ...d, leads: d.leads.map((l) => (l.id === lead.id ? { ...l, status: next } : l)) }
        : d,
    );
    try {
      await api(`/api/leads/${lead.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      refresh();
    } catch {
      setData((d) => (d ? { ...d, leads: current } : d));
    }
  }

  async function removeLead(lead: SavedLead) {
    try {
      await api(`/api/leads/${lead.id}`, { method: 'DELETE' });
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete lead');
    }
  }

  const filtered = (data?.leads ?? []).filter((l) => {
    const matchesFilter = filter === 'all' || l.status === filter;
    if (!matchesFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      l.name.toLowerCase().includes(q) ||
      (l.industry ?? '').toLowerCase().includes(q) ||
      (l.location ?? '').toLowerCase().includes(q)
    );
  });

  const s = data?.stats;

  return (
    <div className='p-4 sm:p-6 lg:p-8'>
      {/* Header */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-ink-900'>Pipeline Dashboard</h1>
          <p className='mt-1 text-sm text-ink-500'>
            Track every lead from discovery to closed deal.
          </p>
        </div>
        <Link
          href='/search'
          className='inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-accent-500 px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition-all hover:-translate-y-0.5'
        >
          <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
            <path d='M12 5v14M5 12h14' />
          </svg>
          Find new leads
        </Link>
      </div>

      {error && (
        <div className='mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
          {error}
        </div>
      )}

      {/* KPI cards */}
      <div className='mt-6 grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-7'>
        <Kpi label='Total leads' value={s?.total ?? 0} color='text-ink-900' />
        <Kpi label='New' value={s?.newLeads ?? 0} color='text-cyan-600' />
        <Kpi label='Contacted' value={s?.contacted ?? 0} color='text-amber-600' />
        <Kpi label='Responded' value={s?.responded ?? 0} color='text-violet-600' />
        <Kpi label='Won' value={s?.won ?? 0} color='text-emerald-600' />
        <Kpi label='Lost' value={s?.lost ?? 0} color='text-red-600' />
        <Kpi label='Win rate' value={s ? `${s.winRate}%` : '0%'} color='text-brand-600' />
      </div>

      {/* Toolbar */}
      <div className='mt-6 flex flex-col gap-3 sm:flex-row sm:items-center'>
        <div className='flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-3.5 py-2.5 sm:min-w-64'>
          <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' className='text-ink-400'>
            <circle cx='11' cy='11' r='8' />
            <path d='m21 21-4.3-4.3' />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Search leads...'
            className='w-full bg-transparent text-sm outline-none placeholder:text-ink-400'
          />
        </div>
        <div className='flex flex-wrap gap-2'>
          {(['all', 'new', 'contacted', 'responded', 'won', 'lost'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition-colors ${
                filter === st
                  ? 'bg-ink-900 text-white'
                  : 'bg-white text-ink-500 ring-1 ring-ink-200 hover:bg-ink-50'
              }`}
            >
              {st === 'all' ? 'All' : STATUS_LABEL[st]}
            </button>
          ))}
        </div>
      </div>

      {/* Leads table */}
      <div className='mt-5 overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-card'>
        {loading ? (
          <div className='flex items-center justify-center py-16'>
            <div className='h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent' />
          </div>
        ) : filtered.length === 0 ? (
          <div className='py-16 text-center'>
            <div className='mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-ink-100 text-ink-400'>
              <svg width='26' height='26' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'>
                <path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' />
                <circle cx='9' cy='7' r='4' />
              </svg>
            </div>
            <h3 className='text-base font-semibold text-ink-900'>No leads here yet</h3>
            <p className='mt-1 text-sm text-ink-500'>
              Search across 6 sources and add your first lead to the dashboard.
            </p>
            <Link
              href='/search'
              className='mt-4 inline-flex rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600'
            >
              Find leads
            </Link>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full min-w-[760px]'>
              <thead>
                <tr className='border-b border-ink-100 bg-ink-50 text-left'>
                  {['Lead', 'Industry', 'Location', 'Contact', 'Status', 'Added', 'Actions'].map((h) => (
                    <th
                      key={h}
                      className='px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-400'
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead) => (
                  <tr key={lead.id} className='border-b border-ink-50 transition-colors hover:bg-ink-50/50'>
                    <td className='px-5 py-3.5'>
                      <div className='flex items-center gap-3'>
                        <div className='grid h-9 w-9 flex-shrink-0 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-accent-500 text-xs font-bold text-white'>
                          {initials(lead.name)}
                        </div>
                        <div className='min-w-0'>
                          <p className='truncate text-sm font-semibold text-ink-900'>{lead.name}</p>
                          {lead.website && (
                            <a
                              href={lead.website}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='max-w-40 truncate text-xs text-brand-600 hover:underline'
                            >
                              {prettyDomain(lead.website)}
                            </a>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className='px-5 py-3.5 text-sm text-ink-500'>
                      {lead.industry || '—'}
                    </td>
                    <td className='px-5 py-3.5 text-sm text-ink-500'>
                      {lead.location || '—'}
                    </td>
                    <td className='px-5 py-3.5 text-sm text-ink-600'>
                      {lead.email ? (
                        <span className='flex items-center gap-1.5'>
                          <span className='h-1.5 w-1.5 rounded-full bg-emerald-500' />
                          {lead.email}
                        </span>
                      ) : lead.phone ? (
                        lead.phone
                      ) : (
                        <span className='text-ink-400'>—</span>
                      )}
                    </td>
                    <td className='px-5 py-3.5'>
                      <StatusPill status={lead.status} />
                    </td>
                    <td className='px-5 py-3.5 text-sm text-ink-500'>
                      {new Date(lead.savedAt).toLocaleDateString()}
                    </td>
                    <td className='px-5 py-3.5'>
                      <div className='flex items-center gap-1.5'>
                        <StatusSelect value={lead.status} onChange={(v) => updateStatus(lead, v)} />
                        <button
                          onClick={() => removeLead(lead)}
                          className='grid h-8 w-8 place-items-center rounded-lg text-ink-400 transition-colors hover:bg-red-50 hover:text-red-500'
                          aria-label='Remove lead'
                        >
                          <svg width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                            <path d='M3 6h18' />
                            <path d='M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Kpi({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className='rounded-2xl border border-ink-100 bg-white p-4 shadow-card'>
      <div className='text-[11px] font-semibold uppercase tracking-wider text-ink-400'>
        {label}
      </div>
      <div className={`mt-1.5 text-2xl font-extrabold ${color}`}>{value}</div>
    </div>
  );
}

function StatusPill({ status }: { status: LeadStatus }) {
  return <Badge variant={STATUS_VARIANT[status]}>{STATUS_LABEL[status]}</Badge>;
}

function StatusSelect({ value, onChange }: { value: LeadStatus; onChange: (v: LeadStatus) => void }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as LeadStatus)}
      className='rounded-lg border border-ink-200 bg-white px-2 py-1.5 text-xs font-medium text-ink-600 outline-none focus:border-brand-500'
    >
      {Object.entries(STATUS_LABEL).map(([key, label]) => (
        <option key={key} value={key}>
          {label}
        </option>
      ))}
    </select>
  );
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('');
}

function prettyDomain(website: string): string {
  try {
    return new URL(website).hostname.replace(/^www\./, '');
  } catch {
    return website;
  }
}