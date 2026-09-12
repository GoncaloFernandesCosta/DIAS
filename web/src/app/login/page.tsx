'use client';

import { useState, FormEvent, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/ui/Button';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    if (res?.error) {
      setError('Invalid credentials. Try demo@leadpilot.io / demo1234');
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <main className='flex min-h-screen items-center justify-center bg-ink-900 px-4'>
      <div className='absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(16,185,129,.15),transparent_60%)]' />
      <div className='relative w-full max-w-md'>
        <div className='rounded-2xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl'>
          <div className='mb-8 text-center'>
            <div className='mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-accent-500 font-mono text-xl font-bold text-white shadow-glow'>
              L
            </div>
            <h1 className='text-2xl font-bold text-white'>Welcome back</h1>
            <p className='mt-1 text-sm text-ink-400'>
              Sign in to your LeadPilot account
            </p>
          </div>

          {error && (
            <div className='mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300'>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
            <div>
              <label htmlFor='email' className='mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-300'>
                Email
              </label>
              <input
                id='email'
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='you@company.com'
                required
                className='w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-ink-500 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30'
              />
            </div>

            <div>
              <label htmlFor='password' className='mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-300'>
                Password
              </label>
              <input
                id='password'
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='••••••••'
                required
                className='w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-ink-500 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30'
              />
            </div>

            <Button type='submit' size='lg' disabled={loading} className='w-full'>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <div className='my-6 flex items-center gap-3'>
            <div className='h-px flex-1 bg-white/10' />
            <span className='text-xs text-ink-500'>or</span>
            <div className='h-px flex-1 bg-white/10' />
          </div>

          <Button
            variant='outline'
            size='lg'
            className='w-full border-white/15 bg-white/5 text-white hover:bg-white/10'
            onClick={() => signIn('google', { callbackUrl })}
          >
            <svg width='18' height='18' viewBox='0 0 24 24'>
              <path fill='#4285F4' d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z' />
              <path fill='#34A853' d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z' />
              <path fill='#FBBC05' d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.98 10.98 0 0 0 1 12c0 1.77.43 3.44 1.18 4.93l2.85-2.22.81-.62z' />
              <path fill='#EA4335' d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z' />
            </svg>
            Sign in with Google
          </Button>

          <p className='mt-6 text-center text-sm text-ink-400'>
            Don&apos;t have an account?{' '}
            <a href='/signup' className='font-semibold text-brand-400 hover:text-brand-300'>
              Get started free
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}