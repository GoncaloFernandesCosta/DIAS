import { LeadSearchService } from './application/lead-search-service';
import type { LeadSearchParams, LeadResult, LeadSource, LeadSourceConfig, LeadSourceId, LeadSearchSummary } from './domain/types';
import { GooglePlacesAdapter } from './infrastructure/google-places.adapter';
import { FacebookAdapter } from './infrastructure/facebook.adapter';
import { HunterAdapter } from './infrastructure/hunter.adapter';
import { ApolloAdapter } from './infrastructure/apollo.adapter';
import { CrunchbaseAdapter } from './infrastructure/crunchbase.adapter';
import { SerpAdapter } from './infrastructure/serp.adapter';
import { DemoSearchAdapter } from './infrastructure/demo.adapter';

export function buildLeadSearchService(config: LeadSourceConfig): LeadSearchService {
  const providers = [
    new GooglePlacesAdapter(config.googlePlacesApiKey),
    new FacebookAdapter(config.facebookAccessToken),
    new ApolloAdapter(config.apolloApiKey),
    new CrunchbaseAdapter(config.crunchbaseApiKey),
    new SerpAdapter(config.serpApiKey),
    new DemoSearchAdapter(),
  ];
  const enrichers = [
    new HunterAdapter(config.hunterApiKey),
  ];

  return new LeadSearchService({ providers, enrichers });
}

export function configuredLeadSourceIds(config: LeadSourceConfig): LeadSourceId[] {
  return buildLeadSearchService(config)
    .listSources()
    .filter((s) => s.configured)
    .map((s) => s.id);
}

export {
  LeadSearchService,
  GooglePlacesAdapter,
  FacebookAdapter,
  HunterAdapter,
  ApolloAdapter,
  CrunchbaseAdapter,
  SerpAdapter,
  DemoSearchAdapter,
};
export type {
  LeadSearchParams,
  LeadResult,
  LeadSource,
  LeadSourceConfig,
  LeadSourceId,
  LeadSearchSummary,
};