import type {
  __experimental_CommerceSettingsResource,
  AuthConfigResource,
  DisplayConfigResource,
  EnvironmentJSON,
  EnvironmentJSONSnapshot,
  EnvironmentResource,
  OrganizationSettingsResource,
  UserSettingsResource,
} from '@clerk/types';

import { __experimental_CommerceSettings, AuthConfig, BaseResource, DisplayConfig, UserSettings } from './internal';
import { OrganizationSettings } from './OrganizationSettings';

export class Environment extends BaseResource implements EnvironmentResource {
  private static instance: Environment;

  authConfig: AuthConfigResource = new AuthConfig();
  displayConfig: DisplayConfigResource = new DisplayConfig();
  maintenanceMode: boolean = false;
  pathRoot = '/environment';
  // @ts-expect-error - This is a partial object, but we want to ensure that all attributes are present.
  userSettings: UserSettingsResource = new UserSettings();
  organizationSettings: OrganizationSettingsResource = new OrganizationSettings();
  __experimental_commerceSettings: __experimental_CommerceSettingsResource = new __experimental_CommerceSettings();

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
    this.maintenanceMode = data.maintenance_mode ?? this.maintenanceMode;
    this.organizationSettings = new OrganizationSettings(data.organization_settings);
    // @ts-expect-error - This is a partial object, but we want to ensure that all attributes are present.
    this.userSettings = new UserSettings(data.user_settings);
    this.__experimental_commerceSettings = new __experimental_CommerceSettings(data.commerce_settings);

    return this;
  }

  fetch({ touch, fetchMaxTries }: { touch: boolean; fetchMaxTries?: number } = { touch: false }): Promise<Environment> {
    return touch ? this._basePatch({}) : this._baseGet({ fetchMaxTries });
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
      id: this.id || '',
      maintenance_mode: this.maintenanceMode,
      organization_settings: this.organizationSettings.__internal_toSnapshot(),
      user_settings: this.userSettings.__internal_toSnapshot(),
      commerce_settings: this.__experimental_commerceSettings.__internal_toSnapshot(),
    };
  }
}
