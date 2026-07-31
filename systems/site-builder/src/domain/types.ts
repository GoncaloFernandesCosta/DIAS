import { ProposalCaseData } from '@dias/contracts';

export type SiteTier = 'simple' | 'complex';

export interface SiteSpec {
  caseId: string;
  tier: SiteTier;
  theme?: string;
  company: ProposalCaseData;
}

export interface BuiltSite {
  caseId: string;
  tier: SiteTier;
  outputPath: string;
  previewUrl: string;
  fileUrl: string;
}
