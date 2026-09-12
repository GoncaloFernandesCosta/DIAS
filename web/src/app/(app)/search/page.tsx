'use client';

import { useEffect, useState, FormEvent } from 'react';
import Link from 'next/link';
import type { LeadResult, LeadSourceId, SourceConfig } from '@/types';
import { api } from '@/lib/api';
import Badge from '@/components/ui/Badge';

interface SourcesResponse {
  sources: SourceConfig[];
}

interface SearchSummary {
  query: { query: string; location?: string; industry?: string };
  searched: string[];
  total: number;
  results: LeadResult[];
  bySource: Record<string, number>;
  skipped: Array<{ source: string; reason: string }>;
}

const SOURCE_NAMES: Record<string, string> = {
  'google-places': 'Google',
  facebook: 'Meta',
  hunter: 'Hunter',
  apollo: 'Apollo',
  crunchbase: 'Crunchbase',
  serp: 'Google Search',
  demo: 'Demo',
};

export default function SearchPage() {
  const [sources, setSources] = useState<SourceConfig[]>([]);
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [industry, setIndustry] = useState('');
  const [selectedSources, setSelectedSources] = useState<LeadSourceId[]>([]);
  const [summary, setSummary] = useState<SearchSummary | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api<SourcesResponse>('/api/sources').then((res) => {
      setSources(res.sources);
      const auto = res.sources.filter((s) => s.configured).map((s) => s.id);
      if (auto.length > 0) setSelectedSources(auto);
    }).catch(() => {});
  }, []);

  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setSearching(true);
    setError('');
    setSummary(null);
    setSavedIds(new Set());
    try {
      const res = await api<SearchSummary>('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q, location, industry, sources: selectedSources, limit: 50 }),
      });
      setSummary(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setSearching(false);
    }
  }

  async function addToDashboard(lead: LeadResult) {
    setSaving(lead.id);
    const { id, ...payload } = lead;
    void id;
    try {
      await api('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setSavedIds((prev) => {
        const next = new Set(prev);
        next.add(lead.id);
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save lead');
    } finally {
      setSaving(null);
    }
  }

  const toggleSource = (id: LeadSourceId) => {
    setSelectedSources((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id],
    );
  };

  return (
    <div className='p-4 sm:p-6 lg:p-8'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-ink-900'>Find Leads</h1>
          <p className='mt-1 text-sm text-ink-500'>
            One query across Google, Facebook, Apollo, Crunchbase, Hunter and the web.
          </p>
        </div>
        <Link
          href='/dashboard'
          className='inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink-700 transition-colors hover:border-brand-500 hover:text-brand-600'
        >
          View dashboard
        </Link>
      </div>

      {/* Search form */}
      <form
        onSubmit={handleSearch}
        className='mt-6 rounded-2xl border border-ink-100 bg-white p-5 shadow-card'
      >
        <div className='grid gap-4 lg:grid-cols-[1fr_180px_180px_auto]'>
          <div>
            <label className='mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-500'>
              Search query
            </label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='e.g. restaurants, plumbing, dental clinics...'
              required
              className='w-full rounded-xl border border-ink-200 bg-ink-50 px-4 py-2.5 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20'
            />
          </div>
          <div>
            <label className='mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-500'>
              Location
            </label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder='e.g. Lisbon'
              className='w-full rounded-xl border border-ink-200 bg-ink-50 px-4 py-2.5 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20'
            />
          </div>
          <div>
            <label className='mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-500'>
              Industry
            </label>
            <input
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder='optional'
              className='w-full rounded-xl border border-ink-200 bg-ink-50 px-4 py-2.5 text-sm outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20'
            />
          </div>
          <div className='flex items-end'>
            <button
              type='submit'
              disabled={searching || !query.trim()}
              className='inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-accent-500 px-6 py-2.5 text-sm font-semibold text-white shadow-glow transition-all hover:-translate-y-0.5 disabled:opacity-50 lg:w-auto'
            >
              {searching ? (
                <>
                  <span className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                  Searching...
                </>
              ) : (
                <>
                  <svg width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                    <circle cx='11' cy='11' r='8' />
                    <path d='m21 21-4.3-4.3' />
                  </svg>
                  Search
                </>
              )}
            </button>
          </div>
        </div>

        {/* Source toggles */}
        <div className='mt-4 flex flex-wrap items-center gap-2'>
          <span className='mr-1 text-xs font-semibold uppercase tracking-wide text-ink-400'>
            Sources:
          </span>
          {sources.map((src) => {
            const active = selectedSources.includes(src.id);
            return (
              <button
                key={src.id}
                type='button'
                onClick={() => toggleSource(src.id)}
                title={src.configured ? src.description : `Not configured (${src.needsKey.join(', ')})`}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                  active
                    ? 'bg-ink-900 text-white'
                    : 'bg-ink-100 text-ink-500 hover:bg-ink-200'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    src.configured ? 'bg-emerald-400' : 'bg-ink-400'
                  }`}
                />
                {SOURCE_NAMES[src.id] ?? src.name}
              </button>
            );
          })}
        </div>
      </form>

      {error && (
        <div className='mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
          {error}
        </div>
      )}

      {/* Results */}
      {summary && (
        <div className='mt-6'>
          <div className='flex flex-wrap items-center gap-3'>
            <h2 className='text-lg font-bold text-ink-900'>
              {summary.total} lead{summary.total === 1 ? '' : 's'} found
            </h2>
            <div className='flex flex-wrap gap-2'>
              {Object.entries(summary.bySource).map(([src, count]) => (
                <Badge key={src} variant='info'>
                  {SOURCE_NAMES[src] ?? src}: {count}
                </Badge>
              ))}
            </div>
            {summary.skipped.length > 0 && (
              <span className='text-xs text-ink-400'>
                Skipped: {summary.skipped.map((s) => SOURCE_NAMES[s.source] ?? s.source).join(', ')}
              </span>
            )}
          </div>

          <div className='mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
            {summary.results.map((lead) => {
              const saved = savedIds.has(lead.id);
              return (
                <div
                  key={lead.id}
                  className='group flex flex-col rounded-2xl border border-ink-100 bg-white p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl'
                >
                  <div className='flex items-start justify-between gap-3'>
                    <div className='flex min-w-0 items-center gap-3'>
                      <div className='grid h-10 w-10 flex-shrink-0 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-sm font-bold text-white'>
                        {initials(lead.name)}
                      </div>
                      <div className='min-w-0'>
                        <p className='truncate text-sm font-bold text-ink-900'>{lead.name}</p>
                        <span className='text-xs font-medium text-brand-600'>
                          {SOURCE_NAMES[lead.source] ?? lead.source}
                        </span>
                      </div>
                    </div>
                  </div>

                  {lead.description && (
                    <p className='mt-3 line-clamp-2 text-sm leading-relaxed text-ink-500'>
                      {lead.description}
                    </p>
                  )}

                  <div className='mt-3 flex flex-wrap gap-1.5'>
                    {lead.industry && <Badge variant='default'>{lead.industry}</Badge>}
                    {lead.location && <Badge variant='default'>{lead.location}</Badge>}
                    {lead.rating != null && (
                      <Badge variant='warning'>
                        ★ {lead.rating.toFixed(1)} ({lead.reviewCount ?? 0})
                      </Badge>
                    )}
                  </div>

                  <div className='mt-3 flex flex-col gap-1.5 text-xs text-ink-500'>
                    {lead.website && (
                      <a
                        href={lead.website}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='truncate text-brand-600 hover:underline'
                      >
                        {lead.website}
                      </a>
                    )}
                    {lead.email && (
                      <span className='flex items-center gap-1.5'>
                        <span className='h-1.5 w-1.5 rounded-full bg-emerald-500' />
                        {lead.email}
                      </span>
                    )}
                    {lead.phone && <span>📞 {lead.phone}</span>}
                    {lead.social?.linkedin && (
                      <a
                        href={lead.social.linkedin}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='truncate text-blue-600 hover:underline'
                      >
                        LinkedIn
                      </a>
                    )}
                  </div>

                  {lead.techStack && lead.techStack.length > 0 && (
                    <div className='mt-3 flex flex-wrap gap-1'>
                      {lead.techStack.slice(0, 4).map((t) => (
                        <span
                          key={t}
                          className='rounded-md bg-ink-100 px-1.5 py-0.5 font-mono text-[10px] text-ink-500'
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className='mt-auto pt-4'>
                    <button
                      onClick={() => addToDashboard(lead)}
                      disabled={saved || saving === lead.id}
                      className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                        saved
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-gradient-to-r from-brand-500 to-accent-500 text-white shadow-glow hover:-translate-y-0.5'
                      } disabled:cursor-not-allowed disabled:opacity-80`}
                    >
                      {saved ? (
                        <>
                          <svg width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'>
                            <polyline points='20 6 9 17 4 12' />
                          </svg>
                          In dashboard
                        </>
                      ) : saving === lead.id ? (
                        'Adding...'
                      ) : (
                        <>
                          <svg width='15' height='15' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                            <path d='M12 5v14M5 12h14' />
                          </svg>
                          Add to dashboard
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!summary && !searching && (
        <div className='mt-10 rounded-2xl border border-dashed border-ink-200 bg-white/50 p-12 text-center'>
          <div className='mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-brand-500/10 to-accent-500/10 text-brand-500'>
            <svg width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round'>
              <circle cx='11' cy='11' r='8' />
              <path d='m21 21-4.3-4.3' />
            </svg>
          </div>
          <h3 className='text-base font-semibold text-ink-900'>
            Search for your next batch of leads
          </h3>
          <p className='mx-auto mt-1 max-w-md text-sm text-ink-500'>
            Try something like “Italian restaurants in Lisbon”. Results stream in
            from every configured source, enriched and deduplicated.
          </p>
        </div>
      )}
    </div>
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