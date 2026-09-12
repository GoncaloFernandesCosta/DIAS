import { LeadSearchParams, LeadResult, LeadSource } from '../domain/types';

export interface LeadSearchProvider {
  readonly source: LeadSource;
  search(params: LeadSearchParams): Promise<LeadResult[]>;
}

export interface EnrichmentProvider {
  readonly source: LeadSource;
  enrich(lead: LeadResult): Promise<Partial<LeadResult>>;
}

export function isConfigured(config: Record<string, string | undefined>, keys: string[]): boolean {
  return keys.every((key) => Boolean(config[key]));
}
