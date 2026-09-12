import { LeadSearchParams, LeadResult } from '../domain/types';
import { LeadSearchProvider } from '../application/ports';

const source = {
  id: 'demo' as const,
  name: 'Demo Search',
  description: 'Built-in demo source so you can try LeadPilot before connecting APIs.',
  icon: 'D',
  configured: true,
  needsKey: [],
};

const DEMO_DATA: Array<Omit<LeadResult, 'id' | 'source'>> = [
  {
    name: 'Casa dos Sabores',
    description: 'Family-run restaurant specialising in traditional Portuguese cuisine.',
    website: 'https://casadosabores.weebly.com',
    address: 'Rua Augusta 120, Lisbon',
    phone: '+351 213 000 001',
    industry: 'restaurants',
    location: 'Lisbon',
    rating: 4.3,
    reviewCount: 214,
    social: { facebook: 'https://facebook.com/casadosabores' },
  },
  {
    name: 'Marmitas do Bairro',
    description: 'Neighbourhood lunch spot with daily cooking and delivery.',
    website: '',
    address: 'Travessa do Carmo 8, Lisbon',
    phone: '+351 213 000 002',
    industry: 'restaurants',
    location: 'Lisbon',
    rating: 4.1,
    reviewCount: 96,
  },
  {
    name: 'Padaria Central',
    description: 'Traditional bakery and pastry shop founded in 1987.',
    website: 'https://padariacentral.wordpress.com',
    address: 'Avenida da Liberdade 45, Lisbon',
    phone: '+351 213 000 003',
    industry: 'bakeries',
    location: 'Lisbon',
    rating: 4.6,
    reviewCount: 512,
    social: { facebook: 'https://facebook.com/padariacentral' },
  },
  {
    name: 'Clínica Vida',
    description: 'General practice clinic offering consultations and check-ups.',
    website: 'https://clinicavida.wixsite.com/vida',
    address: 'Rua Ferreira Borges 22, Coimbra',
    phone: '+351 239 000 004',
    industry: 'healthcare',
    location: 'Coimbra',
    rating: 4.4,
    reviewCount: 178,
  },
  {
    name: 'Garagem Auto',
    description: 'Independent garage offering repairs, servicing and MOT.',
    website: 'https://garagemauto.pt',
    address: 'Estrada de Benfica 300, Lisbon',
    phone: '+351 213 000 005',
    industry: 'automotive',
    location: 'Lisbon',
    rating: 4.2,
    reviewCount: 143,
    founded: 2005,
    employees: 12,
  },
  {
    name: 'Florista Primavera',
    description: 'Bouquets, plants and same-day delivery in Porto.',
    website: '',
    address: 'Rua de Santa Catarina 78, Porto',
    phone: '+351 223 000 006',
    industry: 'retail',
    location: 'Porto',
    rating: 4.5,
    reviewCount: 88,
  },
  {
    name: 'Encadernações Rápidas',
    description: 'Printing and bookbinding services for businesses.',
    website: 'https://encadernacoes.pt',
    address: 'Praça do Município 14, Braga',
    phone: '+351 253 000 007',
    industry: 'printing',
    location: 'Braga',
    rating: 4.0,
    reviewCount: 61,
    founded: 1998,
  },
  {
    name: 'Tasca Moderna',
    description: 'Modern tapas bar blending tradition with contemporary flavours.',
    website: 'https://tascamoderna.pt',
    address: 'Rua das Flores 66, Porto',
    phone: '+351 223 000 008',
    industry: 'restaurants',
    location: 'Porto',
    rating: 4.7,
    reviewCount: 389,
    social: { facebook: 'https://facebook.com/tascamoderna' },
  },
];

export class DemoSearchAdapter implements LeadSearchProvider {
  readonly source: typeof source;

  constructor() {
    this.source = { ...source };
  }

  async search(params: LeadSearchParams): Promise<LeadResult[]> {
    const q = (params.query || '').toLowerCase();
    const location = (params.location || '').toLowerCase();
    const industry = (params.industry || '').toLowerCase();

    const results = DEMO_DATA.filter((c) => {
      if (q) {
        const haystack = [
          c.name,
          c.description,
          c.industry,
          ...(c.social?.facebook ?? ''),
        ].join(' ').toLowerCase();
        if (!matchesQuery(haystack, q)) return false;
      }
      if (location && !(c.location ?? '').toLowerCase().includes(location)) return false;
      if (industry && !(c.industry ?? '').toLowerCase().includes(industry)) return false;
      return true;
    });

    await new Promise((r) => setTimeout(r, 450));

    return results.slice(0, params.limit ?? 25).map((c, i) => ({
      ...c,
      id: `demo-${i}-${slug(c.name)}`,
      source: 'demo',
    }));
  }
}

function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

function matchesQuery(haystack: string, query: string): boolean {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  return terms.some((term) => {
    if (haystack.includes(term)) return true;
    return haystack.includes(stripPlural(term));
  });
}

function stripPlural(word: string): string {
  return word.length > 3 && word.endsWith('s') ? word.slice(0, -1) : word;
}