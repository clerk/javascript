import type {
  AuthConfigResource,
  CommerceSettingsResource,
  DisplayConfigResource,
  EnableEnvironmentSettingParams,
  EnvironmentJSON,
  EnvironmentJSONSnapshot,
  EnvironmentResource,
  OrganizationSettingsResource,
  ProtectConfigResource,
  UserSettingsResource,
} from '@clerk/shared/types';

import { eventBus, events } from '../../core/events';
import { APIKeySettings } from './APIKeySettings';
import { AuthConfig, BaseResource, CommerceSettings, DisplayConfig, ProtectConfig, UserSettings } from './internal';
import { OrganizationSettings } from './OrganizationSettings';

type ForceUpdateResource = {
  ios: Array<{
    bundleId: string;
    minimumVersion: string;
    updateUrl: string | null;
  }>;
  android: Array<{
    packageName: string;
    minimumVersion: string;
    updateUrl: string | null;
  }>;
};

type ForceUpdateJSON = {
  ios?: Array<{
    bundle_id: string;
    minimum_version: string;
    update_url?: string | null;
  }>;
  android?: Array<{
    package_name: string;
    minimum_version: string;
    update_url?: string | null;
  }>;
};

const emptyForceUpdate = (): ForceUpdateResource => ({
  ios: [],
  android: [],
});

const deserializeForceUpdate = (value: ForceUpdateJSON | undefined): ForceUpdateResource => {
  if (!value) {
    return emptyForceUpdate();
  }

  return {
    ios: (value.ios || []).map(policy => ({
      bundleId: policy.bundle_id,
      minimumVersion: policy.minimum_version,
      updateUrl: policy.update_url ?? null,
    })),
    android: (value.android || []).map(policy => ({
      packageName: policy.package_name,
      minimumVersion: policy.minimum_version,
      updateUrl: policy.update_url ?? null,
    })),
  };
};

const serializeForceUpdate = (
  value: ForceUpdateResource | undefined,
): ForceUpdateJSON => {
  return {
    ios: (value?.ios || []).map(policy => ({
      bundle_id: policy.bundleId,
      minimum_version: policy.minimumVersion,
      update_url: policy.updateUrl,
    })),
    android: (value?.android || []).map(policy => ({
      package_name: policy.packageName,
      minimum_version: policy.minimumVersion,
      update_url: policy.updateUrl,
    })),
  };
};

export class Environment extends BaseResource implements EnvironmentResource {
  private static instance: Environment;

  authConfig: AuthConfigResource = new AuthConfig();
  displayConfig: DisplayConfigResource = new DisplayConfig();
  maintenanceMode: boolean = false;
  clientDebugMode: boolean = false;
  pathRoot = '/environment';
  userSettings: UserSettingsResource = new UserSettings();
  organizationSettings: OrganizationSettingsResource = new OrganizationSettings();
  commerceSettings: CommerceSettingsResource = new CommerceSettings();
  apiKeysSettings: APIKeySettings = new APIKeySettings();
  protectConfig: ProtectConfigResource = new ProtectConfig();
  forceUpdate: ForceUpdateResource = emptyForceUpdate();

  public static getInstance(): Environment {
    if (!Environment.instance) {
      Environment.instance = new Environment();
    }

    return Environment.instance;
  }

  constructor(data: EnvironmentJSON | EnvironmentJSONSnapshot | null = null) {
    super();

    this.fromJSON(data);
  }

  protected fromJSON(data: EnvironmentJSONSnapshot | EnvironmentJSON | null): this {
    if (!data) {
      return this;
    }

    this.authConfig = new AuthConfig(data.auth_config);
    this.displayConfig = new DisplayConfig(data.display_config);
    this.maintenanceMode = this.withDefault(data.maintenance_mode, this.maintenanceMode);
    this.clientDebugMode = this.withDefault(data.client_debug_mode, this.clientDebugMode);
    this.organizationSettings = new OrganizationSettings(data.organization_settings);
    this.userSettings = new UserSettings(data.user_settings);
    this.commerceSettings = new CommerceSettings(data.commerce_settings);
    this.apiKeysSettings = new APIKeySettings(data.api_keys_settings);
    this.protectConfig = new ProtectConfig(data.protect_config);
    this.forceUpdate = deserializeForceUpdate((data as EnvironmentJSON & { force_update?: ForceUpdateJSON }).force_update);

    return this;
  }

  fetch({ touch, fetchMaxTries }: { touch: boolean; fetchMaxTries?: number } = { touch: false }): Promise<Environment> {
    const promise = touch ? this._basePatch({}) : this._baseGet({ fetchMaxTries });

    return promise.then(data => {
      eventBus.emit(events.EnvironmentUpdate, null);
      return data;
    });
  }

  isDevelopmentOrStaging = (): boolean => {
    return !this.isProduction();
  };

  isProduction = (): boolean => {
    return this.displayConfig.instanceEnvironmentType === 'production';
  };

  isSingleSession = (): boolean => {
    return this.authConfig.singleSessionMode;
  };

  onWindowLocationHost = (): boolean => {
    return this.displayConfig.backendHost === window.location.host;
  };

  public __internal_toSnapshot(): EnvironmentJSONSnapshot {
    return {
      object: 'environment',
      auth_config: this.authConfig.__internal_toSnapshot(),
      display_config: this.displayConfig.__internal_toSnapshot(),
      id: this.id ?? '',
      maintenance_mode: this.maintenanceMode,
      client_debug_mode: this.clientDebugMode,
      organization_settings: this.organizationSettings.__internal_toSnapshot(),
      user_settings: this.userSettings.__internal_toSnapshot(),
      commerce_settings: this.commerceSettings.__internal_toSnapshot(),
      api_keys_settings: this.apiKeysSettings.__internal_toSnapshot(),
      protect_config: this.protectConfig.__internal_toSnapshot(),
      force_update: serializeForceUpdate(this.forceUpdate),
    } as EnvironmentJSONSnapshot;
  }

  async __internal_enableEnvironmentSetting(params: EnableEnvironmentSettingParams) {
    await this._basePatch({
      path: `/dev_tools/enable_environment_setting`,
      body: params,
    });
  }
}
