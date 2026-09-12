const PLANS = [
  {
    name: 'Starter',
    price: '$0',
    period: '/month',
    description: 'For solo founders testing the waters.',
    features: [
      '100 leads / month',
      'Demo source only',
      '2 active pipelines',
      'Community support',
    ],
    cta: 'Start free',
    highlighted: false,
    href: '/signup',
  },
  {
    name: 'Pro',
    price: '$49',
    period: '/month',
    description: 'For growing teams hunting leads every day.',
    features: [
      '10,000 leads / month',
      'All 6 API sources',
      'Unlimited pipelines',
      'Email + SMS outreach',
      'AI proposal drafts',
      'Priority support',
    ],
    cta: 'Start 14-day trial',
    highlighted: true,
    href: '/signup',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For sales teams and agencies at scale.',
    features: [
      'Unlimited leads',
      'SSO & audit logs',
      'Custom API adapters',
      'Dedicated account manager',
      'On-prem deployment',
    ],
    cta: 'Talk to sales',
    highlighted: false,
    href: '/contact',
  },
];

export default function Pricing() {
  return (
    <section id='pricing' className='bg-ink-50 px-4 py-24 sm:px-6 lg:px-8'>
      <div className='mx-auto max-w-7xl'>
        <div className='mx-auto max-w-2xl text-center'>
          <span className='text-sm font-bold uppercase tracking-widest text-brand-600'>
            Pricing
          </span>
          <h2 className='mt-3 text-3xl font-extrabold tracking-tight text-ink-900 sm:text-4xl lg:text-5xl'>
            Simple, transparent pricing
          </h2>
          <p className='mt-5 text-lg leading-relaxed text-ink-500'>
            Start free. Upgrade when you start closing bigger deals.
          </p>
        </div>

        <div className='mx-auto mt-14 grid max-w-5xl gap-6 lg:grid-cols-3'>
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex flex-col rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1 ${
                plan.highlighted
                  ? 'bg-ink-900 text-white shadow-2xl lg:scale-105 ring-1 ring-brand-500/40'
                  : 'border border-ink-200 bg-white shadow-card hover:shadow-xl'
              }`}
            >
              {plan.highlighted && (
                <div className='absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-brand-500 to-accent-500 px-4 py-1 text-xs font-bold text-white shadow-glow'>
                  Most popular
                </div>
              )}
              <h3 className={`text-lg font-bold ${plan.highlighted ? 'text-white' : 'text-ink-900'}`}>
                {plan.name}
              </h3>
              <div className='mt-3 flex items-baseline gap-1'>
                <span className={`text-4xl font-extrabold tracking-tight ${plan.highlighted ? 'text-white' : 'text-ink-900'}`}>
                  {plan.price}
                </span>
                {plan.period && (
                  <span className={`text-sm ${plan.highlighted ? 'text-ink-300' : 'text-ink-500'}`}>
                    {plan.period}
                  </span>
                )}
              </div>
              <p className={`mt-2 text-sm ${plan.highlighted ? 'text-ink-300' : 'text-ink-500'}`}>
                {plan.description}
              </p>
              <ul className='mt-6 flex flex-col gap-3'>
                {plan.features.map((feature) => (
                  <li key={feature} className='flex items-center gap-2.5 text-sm'>
                    <svg
                      width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'
                      className={plan.highlighted ? 'text-brand-400' : 'text-brand-600'}
                    >
                      <polyline points='20 6 9 17 4 12' />
                    </svg>
                    <span className={plan.highlighted ? 'text-ink-200' : 'text-ink-600'}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              <div className='mt-auto pt-7'>
                <a
                  href={plan.href}
                  className={`flex w-full items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${
                    plan.highlighted
                      ? 'bg-gradient-to-r from-brand-500 to-accent-500 text-white hover:shadow-glow hover:-translate-y-0.5'
                      : 'border border-ink-200 bg-white text-ink-900 hover:border-brand-500 hover:text-brand-600'
                  }`}
                >
                  {plan.cta}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}