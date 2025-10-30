import type { ClerkResource } from './resource';
import type { IdentificationLinkJSONSnapshot } from './snapshots';

export interface IdentificationLinkResource extends ClerkResource {
  id: string;
  type: string;
  __internal_toSnapshot(): IdentificationLinkJSONSnapshot;
}
