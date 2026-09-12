import { buildLeadSearchService, LeadSearchService } from '@dias/lead-sources';

let cached: LeadSearchService | null = null;

export function getLeadSearchService(): LeadSearchService {
  if (cached) return cached;
  cached = buildLeadSearchService({
    googlePlacesApiKey: process.env.GOOGLE_PLACES_API_KEY,
    facebookAccessToken: process.env.FACEBOOK_ACCESS_TOKEN,
    hunterApiKey: process.env.HUNTER_API_KEY,
    apolloApiKey: process.env.APOLLO_API_KEY,
    crunchbaseApiKey: process.env.CRUNCHBASE_API_KEY,
    serpApiKey: process.env.SERP_API_KEY,
  });
  return cached;
}

export function getEnvConfig() {
  return {
    googlePlacesApiKey: process.env.GOOGLE_PLACES_API_KEY,
    facebookAccessToken: process.env.FACEBOOK_ACCESS_TOKEN,
    hunterApiKey: process.env.HUNTER_API_KEY,
    apolloApiKey: process.env.APOLLO_API_KEY,
    crunchbaseApiKey: process.env.CRUNCHBASE_API_KEY,
    serpApiKey: process.env.SERP_API_KEY,
  };
}