import Card from '@/components/ui/Card';

const FEATURES = [
  {
    icon: (
      <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
        <circle cx='11' cy='11' r='8' /><path d='m21 21-4.3-4.3' />
      </svg>
    ),
    title: 'Multi-Source Search',
    description:
      'Query Google Places, Facebook, Apollo, Crunchbase and the open web in a single request. Results are merged, deduplicated and ranked automatically.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: (
      <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
        <path d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2' />
        <circle cx='9' cy='7' r='4' />
        <path d='M22 21v-2a4 4 0 0 0-3-3.87' />
        <path d='M16 3.13a4 4 0 0 1 0 7.75' />
      </svg>
    ),
    title: 'Instant Enrichment',
    description:
      'Hunter.io verifies emails, Apollo adds titles, and Crunchbase surfaces funding rounds. Every lead arrives ready to contact.',
    color: 'from-brand-500 to-emerald-400',
  },
  {
    icon: (
      <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
        <rect x='3' y='3' width='18' height='18' rx='2' ry='2' />
        <path d='M3 9h18' />
        <path d='M9 21V9' />
      </svg>
    ),
    title: 'Kanban Dashboard',
    description:
      'Drag-and-drop leads through Discovery → Proposal → Outreach → Closed. Track every deal in real time with KPI cards and activity logs.',
    color: 'from-violet-500 to-purple-400',
  },
  {
    icon: (
      <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
        <path d='M12 20h9' />
        <path d='M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z' />
      </svg>
    ),
    title: 'AI Drafts',
    description:
      'Generate personalised email and SMS proposals with one click. Pick from AI-powered A/B variants and let LeadPilot send on your behalf.',
    color: 'from-amber-500 to-orange-400',
  },
  {
    icon: (
      <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
        <path d='M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z' />
        <path d='M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z' />
      </svg>
    ),
    title: 'Auto Site Builder',
    description:
      'Detect outdated websites and build modern replacements in seconds — 6 industry themes, single-page or multi-page, tailored per lead.',
    color: 'from-pink-500 to-rose-400',
  },
  {
    icon: (
      <svg width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
        <path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10' />
        <path d='m9 12 2 2 4-4' />
      </svg>
    ),
    title: 'Security & Privacy',
    description:
      'Your API keys stay on your server. LeadPilot never sells your data. SOC2-aligned storage and GDPR-compliant retention policies.',
    color: 'from-teal-500 to-cyan-400',
  },
];

export default function Features() {
  return (
    <section id='features' className='relative bg-ink-50 px-4 py-24 sm:px-6 lg:px-8'>
      <div className='absolute inset-0 bg-gradient-to-b from-white to-ink-50' />

      <div className='relative mx-auto max-w-7xl'>
        <div className='mx-auto max-w-2xl text-center'>
          <span className='text-sm font-bold uppercase tracking-widest text-brand-600'>
            Everything you need
          </span>
          <h2 className='mt-3 text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl lg:text-5xl'>
            From first search to closed deal
          </h2>
          <p className='mt-5 text-lg leading-relaxed text-ink-500'>
            LeadPilot replaces five separate tools with one fast, developer-friendly
            platform that plugs into the APIs you already use.
          </p>
        </div>

        <div className='mx-auto mt-14 grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-3'>
          {FEATURES.map((f) => (
            <Card
              key={f.title}
              className='group relative overflow-hidden p-6 hover:-translate-y-1 hover:shadow-xl transition-all duration-300'
            >
              <div className={`absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br ${f.color} opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-20`} />
              <div className={`relative mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${f.color} text-white shadow-lg`}>
                {f.icon}
              </div>
              <h3 className='relative text-lg font-bold text-ink-900'>{f.title}</h3>
              <p className='relative mt-2.5 text-sm leading-relaxed text-ink-500'>
                {f.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}