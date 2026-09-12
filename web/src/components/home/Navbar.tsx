'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

const NAV = [
  { href: '#features', label: 'Features' },
  { href: '#integrations', label: 'Integrations' },
  { href: '#pricing', label: 'Pricing' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-ink-900/85 backdrop-blur-xl shadow-lg shadow-ink-900/20'
          : 'bg-transparent'
      }`}
    >
      <nav className='mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8'>
        <Link href='/' className='flex items-center gap-2.5'>
          <div className='grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-accent-500 font-mono text-sm font-bold text-white shadow-glow'>
            L
          </div>
          <span className='text-lg font-bold tracking-tight text-white'>
            Lead<span className='text-brand-400'>Pilot</span>
          </span>
        </Link>

        <div className='hidden items-center gap-8 md:flex'>
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className='text-sm font-medium text-ink-300 transition-colors hover:text-white'
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className='hidden items-center gap-3 md:flex'>
          <Button href='/login' variant='ghost' size='sm' className='text-white hover:bg-white/10 text-ink-300'>
            Sign in
          </Button>
          <Button href='/signup' size='sm'>
            Get started free
          </Button>
        </div>

        <button
          className='ml-auto flex h-10 w-10 items-center justify-center rounded-lg text-white md:hidden'
          onClick={() => setOpen(!open)}
          aria-label='Toggle menu'
        >
          <svg width='22' height='22' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2'>
            {open ? (
              <path d='M18 6L6 18M6 6l12 12' />
            ) : (
              <path d='M3 6h18M3 12h18M3 18h18' />
            )}
          </svg>
        </button>
      </nav>

      {open && (
        <div className='border-t border-white/10 bg-ink-900/95 px-4 pb-6 pt-4 backdrop-blur-xl md:hidden'>
          <div className='flex flex-col gap-4'>
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className='text-base font-medium text-ink-200 hover:text-white'
              >
                {item.label}
              </a>
            ))}
            <div className='mt-2 flex flex-col gap-3'>
              <Button href='/login' variant='ghost' className='text-white hover:bg-white/10'>
                Sign in
              </Button>
              <Button href='/signup'>Get started free</Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}