import type { AuthConfigJSON } from 'json';

import type { ClerkResource } from './resource';

export interface AuthConfigResource extends ClerkResource {
  /**
   * Enabled single session configuration at the instance level.
   */
  singleSessionMode: boolean;
  toJSON: () => AuthConfigJSON;
}
