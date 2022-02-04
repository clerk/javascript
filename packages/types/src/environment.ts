import { AuthConfigResource } from './authConfig';
import { DisplayConfigResource } from './displayConfig';
import { ClerkResource } from './resource';

export interface EnvironmentResource extends ClerkResource {
  authConfig: AuthConfigResource;
  displayConfig: DisplayConfigResource;
  isSingleSession: () => boolean;
  isProduction: () => boolean;
  onWindowLocationHost: () => boolean;
}
