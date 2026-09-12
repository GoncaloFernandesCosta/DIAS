export type LeadSourceId = 'google-places' | 'facebook' | 'hunter' | 'apollo' | 'crunchbase' | 'serp' | 'demo';

export interface LeadSource {
  id: LeadSourceId;
  name: string;
  description: string;
  icon: string;
  configured: boolean;
  needsKey: string[];
}

export interface LeadSearchParams {
  query: string;
  location?: string;
  industry?: string;
  limit?: number;
  country?: string;
}

export interface LeadResult {
  id: string;
  name: string;
  description?: string;
  website?: string;
  address?: string;
  phone?: string;
  email?: string;
  industry?: string;
  source: LeadSourceId;
  social?: {
    facebook?: string;
    linkedin?: string;
    twitter?: string;
  };
  techStack?: string[];
  location?: string;
  founded?: number;
  employees?: number;
  fundingTotal?: number;
  rating?: number;
  reviewCount?: number;
  titles?: string[];
}

export interface LeadSearchOutcome {
  source: LeadSourceId;
  lead: LeadResult;
  enrichedFrom: LeadSourceId[];
}

export interface LeadSearchSummary {
  query: LeadSearchParams;
  searched: LeadSourceId[];
  total: number;
  results: LeadResult[];
  bySource: Record<LeadSourceId, number>;
  skipped: Array<{ source: LeadSourceId; reason: string }>;
}

export interface LeadSourceConfig {
  googlePlacesApiKey?: string;
  facebookAccessToken?: string;
  hunterApiKey?: string;
  apolloApiKey?: string;
  crunchbaseApiKey?: string;
  serpApiKey?: string;
}
