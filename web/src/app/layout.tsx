import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
});

export const metadata: Metadata = {
  title: {
    default: 'LeadPilot — Find Leads, Close Deals, Scale',
    template: '%s | LeadPilot',
  },
  description:
    'LeadPilot aggregates Google, Facebook, Hunter.io, Apollo, Crunchbase and Search to find the perfect leads, enrich them with contact data, and run your pipeline — all in one dashboard.',
  keywords: [
    'lead generation',
    'SAAS',
    'lead search',
    'google places',
    'crunchbase',
    'apollo',
    'hunter',
    'outreach',
    'sales',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' className='scroll-smooth'>
      <body className={`${inter.variable} ${jetbrains.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}