'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { ReactNode, useEffect } from 'react';
import { SessionProvider } from 'next-auth/react';

const NAV = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
        <rect x='3' y='3' width='7' height='9' rx='1' />
        <rect x='14' y='3' width='7' height='5' rx='1' />
        <rect x='14' y='12' width='7' height='9' rx='1' />
        <rect x='3' y='16' width='7' height='5' rx='1' />
      </svg>
    ),
  },
  {
    href: '/search',
    label: 'Find leads',
    icon: (
      <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
        <circle cx='11' cy='11' r='8' />
        <path d='m21 21-4.3-4.3' />
      </svg>
    ),
  },
  {
    href: '/settings',
    label: 'Integrations',
    icon: (
      <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
        <path d='M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83' />
        <circle cx='12' cy='12' r='3' />
      </svg>
    ),
  },
];

function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'unauthenticated') {
      window.location.href = '/login';
    }
  }, [status]);

  if (status === 'loading') {
    return (
      <div className='flex min-h-screen items-center justify-center bg-ink-50'>
        <div className='h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent' />
      </div>
    );
  }

  const name = session?.user?.name ?? 'User';
  const email = session?.user?.email ?? '';
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

  return (
    <div className='flex min-h-screen bg-ink-50'>
      {/* Sidebar */}
      <aside className='fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-ink-900 lg:flex'>
        <div className='flex h-16 items-center gap-2.5 px-6'>
          <div className='grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-accent-500 font-mono text-sm font-bold text-white'>
            L
          </div>
          <span className='text-lg font-bold text-white'>
            Lead<span className='text-brand-400'>Pilot</span>
          </span>
        </div>

        <nav className='mt-6 flex flex-1 flex-col gap-1 px-3'>
          {NAV.map((item) => {
            const active = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-brand-500/15 text-brand-300 ring-1 ring-brand-500/30'
                    : 'text-ink-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className='border-t border-white/10 p-4'>
          <div className='flex items-center gap-3'>
            <div className='grid h-9 w-9 flex-shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-xs font-bold text-white'>
              {initials}
            </div>
            <div className='min-w-0 flex-1'>
              <p className='truncate text-sm font-semibold text-white'>{name}</p>
              <p className='truncate text-xs text-ink-400'>{email}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className='text-ink-400 transition-colors hover:text-red-400'
              aria-label='Sign out'
            >
              <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
                <path d='M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' />
                <polyline points='16 17 21 12 16 7' />
                <line x1='21' y1='12' x2='9' y2='12' />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className='fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between bg-ink-900 px-4 lg:hidden'>
        <div className='flex items-center gap-2'>
          <div className='grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-brand-400 to-accent-500 font-mono text-xs font-bold text-white'>
            L
          </div>
          <span className='font-bold text-white'>LeadPilot</span>
        </div>
        <div className='flex items-center gap-2'>
          {NAV.map((item) => {
            const active = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`grid h-9 w-9 place-items-center rounded-lg ${
                  active ? 'bg-brand-500/15 text-brand-300' : 'text-ink-400'
                }`}
                aria-label={item.label}
              >
                {item.icon}
              </Link>
            );
          })}
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className='grid h-9 w-9 place-items-center rounded-lg text-ink-400'
            aria-label='Sign out'
          >
            <svg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
              <path d='M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' />
              <polyline points='16 17 21 12 16 7' />
              <line x1='21' y1='12' x2='9' y2='12' />
            </svg>
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className='flex-1 lg:pl-64'>
        <main className='min-h-screen pt-14 lg:pt-0'>{children}</main>
      </div>
    </div>
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <Shell>{children}</Shell>
    </SessionProvider>
  );
}