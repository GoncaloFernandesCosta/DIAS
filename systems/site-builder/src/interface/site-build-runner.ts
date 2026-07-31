import { BuiltSite, SiteTier } from '../domain/types';
import { SiteBuilderService } from '../application/site-builder-service';
import { ProposalCaseData } from '@dias/contracts';

export async function runSiteBuild(
  service: SiteBuilderService,
  company: ProposalCaseData,
  tier: SiteTier,
): Promise<BuiltSite> {
  return service.buildSite(company, tier);
}
