import {
  EnrichedProspect,
  ProspectParams,
  ProspectingJobResult,
  QualifiedProspect,
  DisqualifiedProspect,
} from '../domain/types';
import { EnrichmentProvider, SearchProvider } from './ports';

export interface QualificationRules {
  qualifiesIfSiteOutdated: boolean;
  qualifiesIfNoWebsite: boolean;
}

export class ProspectingService {
  constructor(
    private readonly searchProvider: SearchProvider,
    private readonly enrichmentProvider: EnrichmentProvider,
    private readonly rules: QualificationRules = {
      qualifiesIfSiteOutdated: true,
      qualifiesIfNoWebsite: true,
    },
  ) {}

  async runJob(params: ProspectParams): Promise<ProspectingJobResult> {
    const rawCompanies = await this.searchProvider.search(params);

    const enriched: EnrichedProspect[] = [];
    for (const raw of rawCompanies) {
      enriched.push(await this.enrichmentProvider.enrich(raw));
    }

    const qualified: QualifiedProspect[] = [];
    const disqualified: DisqualifiedProspect[] = [];

    for (const prospect of enriched) {
      const decision = this.evaluate(prospect);
      if (decision.qualified) {
        qualified.push({ ...prospect, qualified: true, reason: decision.reason });
      } else {
        disqualified.push({ ...prospect, qualified: false, reason: decision.reason });
      }
    }

    return {
      searched: rawCompanies.length,
      enriched: enriched.length,
      qualified: qualified.length,
      disqualified: disqualified.length,
      prospects: qualified,
      disqualifiedProspects: disqualified,
    };
  }

  private evaluate(
    prospect: EnrichedProspect,
  ): { qualified: boolean; reason: string } {
    const hasNoWebsite = !prospect.website;

    if (hasNoWebsite && this.rules.qualifiesIfNoWebsite) {
      return { qualified: true, reason: 'No existing website' };
    }
    if (prospect.siteOutdated && this.rules.qualifiesIfSiteOutdated) {
      return {
        qualified: true,
        reason: `Outdated site detected (${(prospect.techStack ?? []).join(', ') || 'unknown stack'})`,
      };
    }
    return { qualified: false, reason: 'Site is modern, not a good target' };
  }
}
