'use client';

import { useEffect, useState } from 'react';
import type { SourceConfig } from '@/types';
import { api } from '@/lib/api';

interface SourcesResponse {
  sources: SourceConfig[];
}

const ENV_KEYS: Record<string, string> = {
  'google-places': 'GOOGLE_PLACES_API_KEY',
  facebook: 'FACEBOOK_ACCESS_TOKEN',
  hunter: 'HUNTER_API_KEY',
  apollo: 'APOLLO_API_KEY',
  crunchbase: 'CRUNCHBASE_API_KEY',
  serp: 'SERP_API_KEY',
};

export default function SettingsPage() {
  const [sources, setSources] = useState<SourceConfig[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    api<SourcesResponse>('/api/sources').then((res) => setSources(res.sources)).catch(() => {});
  }, []);

  async function copyEnv() {
    const lines = sources
      .map((s) => `${ENV_KEYS[s.id] ?? ''}=`)
      .filter(Boolean)
      .join('\n');
    const full = `# Lead Sources\n${lines}\n\n# Auth (NextAuth)\nNEXTAUTH_SECRET=change-me\nNEXTAUTH_URL=http://localhost:3000`;
    try {
      await navigator.clipboard.writeText(full);
      setCopied('template');
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopied(null);
    }
  }

  return (
    <div className='p-4 sm:p-6 lg:p-8'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-2xl font-bold text-ink-900'>Integrations</h1>
          <p className='mt-1 text-sm text-ink-500'>
            Connect your API keys to unlock real lead data sources.
          </p>
        </div>
        <button
          onClick={copyEnv}
          className='inline-flex items-center gap-2 rounded-xl border border-ink-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink-700 transition-colors hover:border-brand-500 hover:text-brand-600'
        >
          {copied === 'template' ? 'Copied!' : 'Copy .env template'}
        </button>
      </div>

      <div className='mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
        {sources.map((src) => {
          const envKey = ENV_KEYS[src.id];
          return (
            <div
              key={src.id}
              className="rounded-2xl border border-ink-100 bg-white p-5 shadow-card"
            >
              <div className='flex items-start justify-between'>
                <div>
                  <h3 className='text-sm font-bold text-ink-900'>{src.name}</h3>
                  <p className='mt-1 text-xs leading-relaxed text-ink-500'>{src.description}</p>
                </div>
                <span
                  className={`inline-flex flex-shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                    src.configured
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-ink-100 text-ink-500'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      src.configured ? 'bg-emerald-500' : 'bg-ink-400'
                    }`}
                  />
                  {src.configured ? 'Connected' : 'Not configured'}
                </span>
              </div>

              {src.configured ? (
                <div className='mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700'>
                  API key detected. This source is live.
                </div>
              ) : (
                <div className='mt-4 rounded-lg bg-ink-50 px-3.5 py-3'>
                  <p className='text-xs font-semibold text-ink-600'>Required env var</p>
                  <code className='mt-1 block font-mono text-xs text-brand-700'>
                    {envKey}
                  </code>
                  <button
                    onClick={() => {
                      if (envKey) {
                        navigator.clipboard.writeText(envKey);
                        setCopied(envKey);
                        setTimeout(() => setCopied(null), 2000);
                      }
                    }}
                    className='mt-2 text-xs font-semibold text-brand-600 hover:underline'
                  >
                    {copied === envKey ? 'Copied!' : 'Copy key name'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className='mt-6 rounded-2xl border border-brand-200 bg-brand-50 p-6'>
        <h3 className='text-sm font-bold text-brand-900'>No API keys? No problem.</h3>
        <p className='mt-1 max-w-2xl text-sm leading-relaxed text-brand-800'>
          LeadPilot ships with a built-in demo source that returns realistic leads
          instantly. It&apos;s selected automatically until you configure a real
          source — so you can explore the whole product before adding credentials.
        </p>
        <p className='mt-3 text-xs text-brand-700'>
          Keys are read from your environment (or <code>.env</code>) and never exposed to
          the browser.
        </p>
      </div>
    </div>
  );
}