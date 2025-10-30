import type { JWT } from './jwt';
import type { ClerkResource } from './resource';
import type { TokenJSONSnapshot } from './snapshots';

export interface TokenResource extends ClerkResource {
  jwt?: JWT;
  getRawString: () => string;
  __internal_toSnapshot: () => TokenJSONSnapshot;
}
