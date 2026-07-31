import { ProspectParams, RawCompany, EnrichedProspect } from '../domain/types';

export interface SearchProvider {
  search(params: ProspectParams): Promise<RawCompany[]>;
}

export interface EnrichmentProvider {
  enrich(raw: RawCompany): Promise<EnrichedProspect>;
}
