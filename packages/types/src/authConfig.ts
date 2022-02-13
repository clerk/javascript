import { ClerkResource } from './resource';

export interface AuthConfigResource extends ClerkResource {
  /**
   * Enabled single session configuration at the instance level.
   */
  singleSessionMode: boolean;
}
