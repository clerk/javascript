import type { AuthConfigJSONSnapshot } from 'snapshots';

import type { ClerkResource } from './resource';

export interface AuthConfigResource extends ClerkResource {
  /**
   * Enabled single session configuration at the instance level.
   */
  singleSessionMode: boolean;
  /**
   * Timestamp of when the instance was claimed. This only applies to applications created with the Keyless mode.
   * Defaults to `null`.
   */
  claimedAt: Date | null;
  toJSON: () => AuthConfigJSONSnapshot;
}
