import type { ClerkResource } from './resource';

export interface AuthConfigResource extends ClerkResource {
  /**
   * Enabled single session configuration at the instance level.
   */
  singleSessionMode: boolean;

  /**
   * Denotes if the instance will use the new mode for syncing development sessions which uses URL
   * decoration instead of third-party cookies.
   */
  urlBasedSessionSyncing: boolean;
}
