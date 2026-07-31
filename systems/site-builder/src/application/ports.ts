import { SiteSpec, BuiltSite } from '../domain/types';

export interface SiteRenderer {
  render(spec: SiteSpec): Promise<BuiltSite>;
}
