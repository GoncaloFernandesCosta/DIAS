import { ProspectParams, RawCompany } from '../domain/types';
import { SearchProvider } from '../application/ports';

const SEED_COMPANIES: RawCompany[] = [
  {
    companyName: 'Casa dos Sabores',
    industry: 'restaurants',
    region: 'Lisbon',
    website: 'https://casadosabores.weebly.com',
    source: 'local-seed',
    techStack: ['weebly', 'jquery'],
  },
  {
    companyName: 'Marmitas do Bairro',
    industry: 'restaurants',
    region: 'Lisbon',
    website: '',
    source: 'local-seed',
    techStack: [],
  },
  {
    companyName: 'Tasca Moderna',
    industry: 'restaurants',
    region: 'Porto',
    website: 'https://tascamoderna.pt',
    source: 'local-seed',
    techStack: ['next.js', 'react'],
  },
  {
    companyName: 'Padaria Central',
    industry: 'bakeries',
    region: 'Lisbon',
    website: 'https://padariacentral.wordpress.com',
    source: 'local-seed',
    techStack: ['wordpress', 'php 5'],
  },
  {
    companyName: 'Clínica Vida',
    industry: 'healthcare',
    region: 'Coimbra',
    website: 'https://clinicavida.wixsite.com/vida',
    source: 'local-seed',
    techStack: ['wix', 'flash'],
  },
  {
    companyName: 'Garagem Auto',
    industry: 'automotive',
    region: 'Lisbon',
    website: 'https://garagemauto.pt',
    source: 'local-seed',
    techStack: ['vue', 'node'],
  },
  {
    companyName: 'Florista Primavera',
    industry: 'retail',
    region: 'Porto',
    website: '',
    source: 'local-seed',
    techStack: [],
  },
  {
    companyName: 'Encadernações Rápidas',
    industry: 'printing',
    region: 'Braga',
    website: 'https://encadernacoes.pt',
    source: 'local-seed',
    techStack: ['php 4', 'frameset'],
  },
];

export class LocalSearchAdapter implements SearchProvider {
  async search(params: ProspectParams): Promise<RawCompany[]> {
    let results = SEED_COMPANIES;

    if (params.industry) {
      results = results.filter((c) => c.industry === params.industry);
    }
    const region = params.region;
    if (region) {
      results = results.filter(
        (c) => c.region?.toLowerCase() === region.toLowerCase(),
      );
    }
    if (params.keywords) {
      const kw = params.keywords.toLowerCase();
      results = results.filter(
        (c) =>
          c.companyName.toLowerCase().includes(kw) ||
          (c.techStack ?? []).some((t) => t.toLowerCase().includes(kw)),
      );
    }

    const limit = params.limit ?? 100;
    return results.slice(0, limit);
  }
}
