export interface PipelineRunParams {
  industry?: string;
  region?: string;
  keywords?: string;
  limit?: number;
  tier?: 'simple' | 'complex';
  theme?: string;
}

export interface ProspectInput {
  companyName: string;
  industry?: string;
  region?: string;
  website?: string;
  contactEmail?: string;
  contactPhone?: string;
  techStack?: string[];
  siteOutdated: boolean;
}

export interface CaseOutcome {
  caseId: string;
  companyName: string;
  currentState: string;
  previewUrl?: string;
  sentAt?: string;
}

export interface PipelineRunSummary {
  runId: string;
  total: number;
  sent: number;
  failed: number;
  cases: CaseOutcome[];
  errors: Array<{ caseId: string; message: string }>;
}
