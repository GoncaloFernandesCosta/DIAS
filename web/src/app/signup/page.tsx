'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError((data as { error?: string }).error ?? 'Could not create your account.');
        setLoading(false);
        return;
      }

      const signInRes = await signIn('credentials', {
        redirect: false,
        email: email.trim(),
        password,
      });

      if (signInRes?.error) {
        setError('Account created — please sign in with your new credentials.');
        router.push('/login');
        setLoading(false);
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
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
            <h1 className='text-2xl font-bold text-white'>Create your account</h1>
            <p className='mt-1 text-sm text-ink-400'>
              Start finding leads in under 2 minutes
            </p>
          </div>

          {error && (
            <div className='mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300'>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
            <div>
              <label htmlFor='name' className='mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-300'>
                Full name
              </label>
              <input
                id='name'
                type='text'
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder='Ada Lovelace'
                required
                className='w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-ink-500 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30'
              />
            </div>

            <div>
              <label htmlFor='email' className='mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-300'>
                Work email
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
                placeholder='8+ characters'
                required
                className='w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-ink-500 outline-none transition-colors focus:border-brand-500 focus:ring-2 focus:ring-brand-500/30'
              />
            </div>

            <Button type='submit' size='lg' disabled={loading} className='w-full'>
              {loading ? 'Creating account...' : 'Create free account'}
            </Button>
          </form>

          <p className='mt-6 text-center text-sm text-ink-400'>
            Already have an account?{' '}
            <a href='/login' className='font-semibold text-brand-400 hover:text-brand-300'>
              Sign in
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}