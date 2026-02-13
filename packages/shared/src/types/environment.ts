import type { APIKeysSettingsResource } from './apiKeysSettings';
import type { AuthConfigResource } from './authConfig';
import type { CommerceSettingsResource } from './commerceSettings';
import type { EnableEnvironmentSettingParams } from './devtools';
import type { DisplayConfigResource } from './displayConfig';
import type { OrganizationSettingsResource } from './organizationSettings';
import type { ProtectConfigResource } from './protectConfig';
import type { ClerkResource } from './resource';
import type { EnvironmentJSONSnapshot } from './snapshots';
import type { UserSettingsResource } from './userSettings';

export interface IOSForceUpdatePolicyResource {
  bundleId: string;
  minimumVersion: string;
  updateUrl: string | null;
}

export interface AndroidForceUpdatePolicyResource {
  packageName: string;
  minimumVersion: string;
  updateUrl: string | null;
}

export interface ForceUpdateResource {
  ios: IOSForceUpdatePolicyResource[];
  android: AndroidForceUpdatePolicyResource[];
}

export interface EnvironmentResource extends ClerkResource {
  userSettings: UserSettingsResource;
  organizationSettings: OrganizationSettingsResource;
  authConfig: AuthConfigResource;
  displayConfig: DisplayConfigResource;
  commerceSettings: CommerceSettingsResource;
  apiKeysSettings: APIKeysSettingsResource;
  protectConfig: ProtectConfigResource;
  isSingleSession: () => boolean;
  isProduction: () => boolean;
  isDevelopmentOrStaging: () => boolean;
  onWindowLocationHost: () => boolean;
  maintenanceMode: boolean;
  clientDebugMode: boolean;
  forceUpdate?: ForceUpdateResource;
  __internal_toSnapshot: () => EnvironmentJSONSnapshot;
  __internal_enableEnvironmentSetting: (params: EnableEnvironmentSettingParams) => Promise<void>;
}
