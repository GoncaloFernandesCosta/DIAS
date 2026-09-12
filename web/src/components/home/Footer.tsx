import Link from 'next/link';

const COLUMNS = [
  {
    title: 'Product',
    links: ['Features', 'Integrations', 'Pricing', 'Changelog', 'Roadmap'],
  },
  {
    title: 'Company',
    links: ['About', 'Blog', 'Careers', 'Press', 'Contact'],
  },
  {
    title: 'Resources',
    links: ['Documentation', 'API Reference', 'Guides', 'Status', 'Help Center'],
  },
  {
    title: 'Legal',
    links: ['Privacy', 'Terms', 'Security', 'GDPR', 'DPA'],
  },
];

export default function Footer() {
  return (
    <footer className='border-t border-ink-800 bg-ink-900 px-4 pb-10 pt-16 sm:px-6 lg:px-8'>
      <div className='mx-auto max-w-7xl'>
        <div className='grid gap-10 md:grid-cols-6'>
          <div className='md:col-span-2'>
            <Link href='/' className='flex items-center gap-2.5'>
              <div className='grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-400 to-accent-500 font-mono text-sm font-bold text-white'>
                L
              </div>
              <span className='text-lg font-bold tracking-tight text-white'>
                Lead<span className='text-brand-400'>Pilot</span>
              </span>
            </Link>
            <p className='mt-4 max-w-xs text-sm leading-relaxed text-ink-400'>
              Find leads across Google, Facebook, Apollo, Hunter, Crunchbase
              and the web. Enrich, engage and close — all from one dashboard.
            </p>
            <div className='mt-5 flex gap-3'>
              {['X', 'GH', 'IN', 'YT'].map((label) => (
                <a
                  key={label}
                  href='#'
                  className='grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-xs font-bold text-ink-300 transition-colors hover:border-brand-500 hover:text-brand-400'
                  aria-label={label}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className='text-sm font-bold text-white'>{col.title}</h4>
              <ul className='mt-4 flex flex-col gap-2.5'>
                {col.links.map((link) => (
                  <li key={link}>
                    <Link
                      href='#'
                      className='text-sm text-ink-400 transition-colors hover:text-brand-400'
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className='mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row'>
          <p className='text-xs text-ink-500'>
            © {new Date().getFullYear()} LeadPilot. All rights reserved.
          </p>
          <p className='text-xs text-ink-500'>
            Built with <span className='text-brand-400'>lots of espresso</span> and zero bloat.
          </p>
        </div>
      </div>
    </footer>
  );
}