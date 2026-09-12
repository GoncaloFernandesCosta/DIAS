import Button from '@/components/ui/Button';

const STATS = [
  { value: '10M+', label: 'Leads found' },
  { value: '4,200+', label: 'Teams using LeadPilot' },
  { value: '38%', label: 'Avg response rate' },
];

export default function Hero() {
  return (
    <section className='relative isolate overflow-hidden bg-ink-900 px-4 pt-32 pb-20 sm:px-6 sm:pt-40 lg:px-8 lg:pt-48'>
      {/* Background layers */}
      <div className='absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_0%,rgba(16,185,129,.18),transparent_70%)]' />
      <div className='absolute inset-0 bg-grid-pattern opacity-[0.035]' />

      {/* Floating shapes */}
      <div className='absolute top-20 left-[15%] h-72 w-72 animate-float rounded-full bg-brand-500/10 blur-[100px]' />
      <div className='absolute bottom-10 right-[10%] h-64 w-64 animate-float-slow rounded-full bg-accent-500/15 blur-[80px]' />
      <div className='absolute top-40 right-[25%] h-40 w-40 animate-spin-slow rounded-full border border-brand-500/10' />
      <div className='absolute bottom-40 left-[10%] h-24 w-24 animate-pulse-glow rounded-full border border-cyan-400/15' />

      {/* Geometric accent */}
      <div className='absolute top-16 right-8 h-40 w-px bg-gradient-to-b from-transparent via-brand-400/40 to-transparent sm:right-20' />
      <div className='absolute top-16 left-8 h-56 w-px bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent sm:left-20' />

      <div className='relative mx-auto max-w-5xl text-center'>
        {/* Badge */}
        <div className='animate-fade-up mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-sm font-medium text-brand-300'>
          <span className='relative flex h-2 w-2'>
            <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75' />
            <span className='relative inline-flex h-2 w-2 rounded-full bg-brand-400' />
          </span>
          Now with real-time enrichment across 6 sources
        </div>

        {/* Headline */}
        <h1 className='animate-fade-up text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-7xl' style={{ animationDelay: '0.1s' }}>
          Find Leads.
          <br />
          <span className='bg-gradient-to-r from-brand-400 via-accent-400 to-cyan-300 bg-clip-text text-transparent'>
            Close Deals.
          </span>
          <br />
          Scale.
        </h1>

        {/* Subhead */}
        <p className='animate-fade-up mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ink-300 sm:text-xl' style={{ animationDelay: '0.2s' }}>
          Search Google, Facebook, Apollo, Hunter, Crunchbase and the web in
          one query. LeadPilot enriches, qualifies, builds sites, and runs
          your outreach — automatically.
        </p>

        {/* CTA buttons */}
        <div className='animate-fade-up mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center' style={{ animationDelay: '0.3s' }}>
          <Button href='/signup' size='lg' className='w-full sm:w-auto shadow-glow'>
            Start finding leads
            <svg
              width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'
            >
              <path d='M5 12h14M12 5l7 7-7 7' />
            </svg>
          </Button>
          <Button href='#features' variant='outline' size='lg' className='w-full border-white/15 bg-white/5 text-white hover:bg-white/10 sm:w-auto'>
            See how it works
          </Button>
        </div>

        {/* Stats bar */}
        <div
          className='animate-fade-up mt-16 grid grid-cols-3 gap-4 sm:mx-auto sm:max-w-md'
          style={{ animationDelay: '0.4s' }}
        >
          {STATS.map((stat) => (
            <div key={stat.label} className='text-center'>
              <div className='text-2xl font-bold text-white sm:text-3xl'>{stat.value}</div>
              <div className='mt-0.5 text-xs font-medium text-ink-400 sm:text-sm'>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Terminal-style preview */}
        <div
          className='animate-fade-up mx-auto mt-14 max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-1 shadow-2xl backdrop-blur-sm sm:mt-20'
          style={{ animationDelay: '0.5s' }}
        >
          <div className='flex items-center gap-2 rounded-t-xl border-b border-white/10 bg-white/5 px-4 py-2.5'>
            <span className='h-3 w-3 rounded-full bg-red-400/80' />
            <span className='h-3 w-3 rounded-full bg-yellow-400/80' />
            <span className='h-3 w-3 rounded-full bg-green-400/80' />
            <span className='ml-3 font-mono text-xs text-ink-400'>leadpilot search</span>
          </div>
          <div className='overflow-x-auto p-4 sm:p-5'>
            <pre className='font-mono text-left text-xs leading-relaxed sm:text-sm'>
              <code>
                <span className='text-brand-400'>$</span>{' '}
                <span className='text-white'>leadpilot search</span>{' '}
                <span className='text-cyan-300'>{'"restaurants in Lisbon"'}</span>{' '}
                <span className='text-ink-400'>--sources all</span>
                {'\n\n'}
                <span className='text-ink-400'>Searching 6 sources...</span>{'\n'}
                <span className='text-green-400'>✓</span>{' '}
                <span className='text-ink-300'>Google Places</span>{' '}
                <span className='text-ink-500'>8 results</span>{'\n'}
                <span className='text-green-400'>✓</span>{' '}
                <span className='text-ink-300'>Facebook</span>{' '}
                <span className='text-ink-500'>5 results</span>{'\n'}
                <span className='text-green-400'>✓</span>{' '}
                <span className='text-ink-300'>Crunchbase</span>{' '}
                <span className='text-ink-500'>3 results</span>{'\n'}
                <span className='text-green-400'>✓</span>{' '}
                <span className='text-ink-300'>SerpAPI</span>{' '}
                <span className='text-ink-500'>12 results</span>{'\n'}
                <span className='text-amber-400'>!</span>{' '}
                <span className='text-ink-400'>Hunter.io</span>{' '}
                <span className='text-ink-500'>enriching 28 leads with emails...</span>{'\n\n'}
                <span className='text-green-400 font-bold'>24 unique leads found</span>
                <span className='text-ink-500'> across 4 sources</span>{'\n'}
                <span className='text-brand-400'>$</span>{' '}
                <span className='text-white'>_</span>
              </code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}