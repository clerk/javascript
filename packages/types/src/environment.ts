import { AuthConfigResource } from './authConfig';
import { DisplayConfigResource } from './displayConfig';
import { OrganizationSettingsResource } from './organizationSettings';
import { ClerkResource } from './resource';
import { UserSettingsResource } from './userSettings';

export interface EnvironmentResource extends ClerkResource {
  userSettings: UserSettingsResource;
  organizationSettings: OrganizationSettingsResource;
  authConfig: AuthConfigResource;
  displayConfig: DisplayConfigResource;
  isSingleSession: () => boolean;
  isProduction: () => boolean;
  onWindowLocationHost: () => boolean;
}
