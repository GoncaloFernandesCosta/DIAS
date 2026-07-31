import { ProposalCaseData } from '@dias/contracts';
import { BuiltSite, SiteTier } from '../domain/types';
import { SiteRenderer } from './ports';

export class SiteBuilderService {
  constructor(private readonly renderer: SiteRenderer) {}

  async buildSite(
    company: ProposalCaseData,
    tier: SiteTier = 'simple',
  ): Promise<BuiltSite> {
    return this.renderer.render({
      caseId: company.id,
      tier,
      company,
    });
  }
}
