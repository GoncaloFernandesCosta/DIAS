export interface ProspectParams {
  industry?: string;
  region?: string;
  keywords?: string;
  limit?: number;
}

export interface RawCompany {
  companyName: string;
  industry?: string;
  region?: string;
  website?: string;
  source: string;
  techStack?: string[];
}

export interface EnrichedProspect {
  companyName: string;
  industry?: string;
  region?: string;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  techStack?: string[];
  siteOutdated: boolean;
}

export interface QualifiedProspect extends EnrichedProspect {
  qualified: true;
  reason: string;
}

export interface DisqualifiedProspect extends EnrichedProspect {
  qualified: false;
  reason: string;
}

export type ProspectResult = QualifiedProspect | DisqualifiedProspect;

export interface ProspectingJobResult {
  searched: number;
  enriched: number;
  qualified: number;
  disqualified: number;
  prospects: QualifiedProspect[];
  disqualifiedProspects: DisqualifiedProspect[];
}
