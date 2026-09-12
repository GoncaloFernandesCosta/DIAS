import Navbar from '@/components/home/Navbar';
import Hero from '@/components/home/Hero';
import Features from '@/components/home/Features';
import Integrations from '@/components/home/Integrations';
import Pricing from '@/components/home/Pricing';
import CTA from '@/components/home/CTA';
import Footer from '@/components/home/Footer';

export default function HomePage() {
  return (
    <main className='min-h-screen'>
      <Navbar />
      <Hero />
      <Features />
      <Integrations />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  );
}