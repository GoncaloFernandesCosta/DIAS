import { RawCompany, EnrichedProspect } from '../domain/types';
import { EnrichmentProvider } from '../application/ports';

const OUTDATED_TECH_MARKERS = [
  'weebly',
  'wix',
  'wordpress',
  'php',
  'jquery',
  'flash',
  'frameset',
  'frontpage',
];

export class StaticEnrichmentAdapter implements EnrichmentProvider {
  async enrich(raw: RawCompany): Promise<EnrichedProspect> {
    const techStack = raw.techStack ?? [];
    const siteOutdated = this.evaluateOutdated(raw.website, techStack);

    return {
      companyName: raw.companyName,
      industry: raw.industry,
      region: raw.region,
      website: raw.website,
      contactEmail: this.guessContactEmail(raw.companyName, raw.website),
      contactPhone: undefined,
      techStack,
      siteOutdated,
    };
  }

  private evaluateOutdated(website: string | undefined, techStack: string[]): boolean {
    if (!website) return true;
    return techStack.some((t) =>
      OUTDATED_TECH_MARKERS.some((marker) => t.toLowerCase().includes(marker)),
    );
  }

  private guessContactEmail(companyName: string, website?: string): string | undefined {
    const domain = website
      ? new URL(website.startsWith('http') ? website : `https://${website}`).hostname
      : `${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.example.com`;
    return `contact@${domain}`;
  }
}
