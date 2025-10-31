import type { ClerkResource } from './resource';
import type { SamlAccountConnectionJSONSnapshot } from './snapshots';

export interface SamlAccountConnectionResource extends ClerkResource {
  id: string;
  name: string;
  domain: string;
  active: boolean;
  provider: string;
  syncUserAttributes: boolean;
  allowSubdomains: boolean;
  allowIdpInitiated: boolean;
  disableAdditionalIdentifications: boolean;
  createdAt: Date;
  updatedAt: Date;
  __internal_toSnapshot: () => SamlAccountConnectionJSONSnapshot;
}
