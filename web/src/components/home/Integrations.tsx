const SOURCES = [
  {
    id: 'google-places',
    name: 'Google Places',
    description: 'Find local businesses, reviews and contact details',
    logo: (
      <svg width='32' height='32' viewBox='0 0 24 24' fill='none'>
        <path d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z' fill='none' stroke='currentColor' strokeWidth='1.5' />
        <circle cx='12' cy='9' r='2.5' fill='currentColor' opacity='.3' stroke='currentColor' strokeWidth='1.5' />
      </svg>
    ),
    gradient: 'from-blue-500 to-blue-400',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    description: 'Pages, local business listings and reviews',
    logo: (
      <svg width='32' height='32' viewBox='0 0 24 24' fill='currentColor'>
        <path d='M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7.5v4H10V22h4v-8.5z' />
      </svg>
    ),
    gradient: 'from-[#1877F2] to-blue-400',
  },
  {
    id: 'hunter',
    name: 'Hunter.io',
    description: 'Professional email finder and verification',
    logo: (
      <svg width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
        <circle cx='12' cy='12' r='10' />
        <path d='m12 16-4-4 4-4' />
        <path d='m8 12 4 4' />
        <path d='M12 8v8' />
      </svg>
    ),
    gradient: 'from-red-500 to-orange-400',
  },
  {
    id: 'apollo',
    name: 'Apollo.io',
    description: 'B2B contacts and firmographic data at scale',
    logo: (
      <svg width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
        <polygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2' />
      </svg>
    ),
    gradient: 'from-purple-500 to-violet-400',
  },
  {
    id: 'crunchbase',
    name: 'Crunchbase',
    description: 'Funding, founding dates and company trajectories',
    logo: (
      <svg width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
        <line x1='12' y1='20' x2='12' y2='10' />
        <line x1='18' y1='20' x2='18' y2='4' />
        <line x1='6' y1='20' x2='6' y2='16' />
      </svg>
    ),
    gradient: 'from-amber-500 to-yellow-400',
  },
  {
    id: 'serp',
    name: 'SerpAPI',
    description: 'Google Search results for organic business discovery',
    logo: (
      <svg width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
        <circle cx='11' cy='11' r='8' />
        <path d='m21 21-4.3-4.3' />
        <path d='m15 8-4 4' />
        <path d='m11 8 4 4' />
      </svg>
    ),
    gradient: 'from-emerald-500 to-teal-400',
  },
];

export default function Integrations() {
  return (
    <section id='integrations' className='relative overflow-hidden bg-ink-900 px-4 py-24 sm:px-6 lg:px-8'>
      <div className='absolute inset-0 bg-[radial-gradient(80%_50%_at_50%_-20%,rgba(16,185,129,.15),transparent_60%)]' />
      <div className='absolute inset-0 bg-grid-pattern opacity-[0.03]' />

      <div className='relative mx-auto max-w-7xl'>
        <div className='mx-auto max-w-2xl text-center'>
          <span className='text-sm font-bold uppercase tracking-widest text-brand-400'>
            Integrations
          </span>
          <h2 className='mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl'>
            Six sources.{' '}
            <span className='text-gradient-green'>One search.</span>
          </h2>
          <p className='mt-5 text-lg leading-relaxed text-ink-300'>
            Connect the APIs you already have keys for — or run LeadPilot
            with its built-in demo source to get started in seconds.
          </p>
        </div>

        <div className='mx-auto mt-16 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3'>
          {SOURCES.map((src) => (
            <div
              key={src.id}
              className='group relative rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/[0.18] hover:shadow-glow hover:bg-white/[0.06]'
            >
              <div
                className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${src.gradient} text-white shadow-lg`}
              >
                {src.logo}
              </div>
              <h3 className='text-lg font-bold text-white'>{src.name}</h3>
              <p className='mt-2 text-sm leading-relaxed text-ink-400'>
                {src.description}
              </p>
              <div className='mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-brand-400'>
                <span className='h-1.5 w-1.5 rounded-full bg-brand-400' />
                Connect in settings
              </div>
            </div>
          ))}
        </div>

        <p className='mx-auto mt-10 max-w-xl text-center text-sm text-ink-500'>
          Want a new source? Implement the <code className='rounded bg-white/10 px-1.5 py-0.5 font-mono text-brand-300'>LeadSearchProvider</code> interface and register it — done in minutes.
        </p>
      </div>
    </section>
  );
}