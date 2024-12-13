import type { IdentificationLinkJSONSnapshot } from 'snapshots';

import type { ClerkResource } from './resource';

export interface IdentificationLinkResource extends ClerkResource {
  id: string;
  type: string;
  toSnapshot(): IdentificationLinkJSONSnapshot;
}
