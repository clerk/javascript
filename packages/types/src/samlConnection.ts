import type { SamlAccountConnectionJSONSnapshot } from 'snapshots';

import type { ClerkResource } from './resource';

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
  toJSON: () => SamlAccountConnectionJSONSnapshot;
}
