import Button from '@/components/ui/Button';

export default function CTA() {
  return (
    <section className='relative overflow-hidden bg-ink-900 px-4 py-24 sm:px-6 lg:px-8'>
      <div className='absolute inset-0 bg-[radial-gradient(60%_80%_at_50%_100%,rgba(16,185,129,.2),transparent_70%)]' />
      <div className='absolute left-1/4 top-0 h-40 w-40 animate-float rounded-full bg-accent-500/10 blur-[80px]' />
      <div className='absolute right-1/4 bottom-0 h-40 w-40 animate-float-slow rounded-full bg-brand-500/10 blur-[80px]' />

      <div className='relative mx-auto max-w-3xl text-center'>
        <h2 className='text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl'>
          Ready to fill your{' '}
          <span className='text-gradient-green'>pipeline</span> with leads?
        </h2>
        <p className='mx-auto mt-5 max-w-xl text-lg leading-relaxed text-ink-300'>
          Join thousands of teams that start every day with a fresh batch of
          qualified leads. Set up your first search in under 2 minutes.
        </p>
        <div className='mt-9 flex flex-col items-center justify-center gap-4 sm:flex-row'>
          <Button href='/signup' size='lg' className='w-full sm:w-auto shadow-glow'>
            Get started — it&apos;s free
          </Button>
          <Button
            href='/search'
            variant='outline'
            size='lg'
            className='w-full border-white/15 bg-white/5 text-white hover:bg-white/10 sm:w-auto'
          >
            Try the live demo
          </Button>
        </div>
        <p className='mt-6 text-sm text-ink-400'>
          No credit card required · Cancel anytime
        </p>
      </div>
    </section>
  );
}