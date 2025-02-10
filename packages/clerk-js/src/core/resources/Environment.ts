import type {
  AuthConfigResource,
  DisplayConfigResource,
  EnvironmentJSON,
  EnvironmentJSONSnapshot,
  EnvironmentResource,
  OrganizationSettingsResource,
  UserSettingsResource,
} from '@clerk/types';

import { AuthConfig, BaseResource, DisplayConfig, UserSettings } from './internal';
import { OrganizationSettings } from './OrganizationSettings';

export class Environment extends BaseResource implements EnvironmentResource {
  private static instance: Environment;

  pathRoot = '/environment';
  authConfig!: AuthConfigResource;
  displayConfig!: DisplayConfigResource;
  userSettings!: UserSettingsResource;
  organizationSettings!: OrganizationSettingsResource;
  maintenanceMode!: boolean;

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

  fetch({ touch, fetchMaxTries }: { touch: boolean; fetchMaxTries?: number } = { touch: false }): Promise<Environment> {
    if (touch) {
      return this._basePatch({});
    }
    return this._baseGet({ fetchMaxTries });
  }

  isSingleSession = (): boolean => {
    return this.authConfig.singleSessionMode;
  };

  isProduction = (): boolean => {
    return this.displayConfig.instanceEnvironmentType === 'production';
  };

  isDevelopmentOrStaging = (): boolean => {
    return !this.isProduction();
  };

  onWindowLocationHost = (): boolean => {
    return this.displayConfig.backendHost === window.location.host;
  };

  protected fromJSON(data: EnvironmentJSONSnapshot | EnvironmentJSON | null): this {
    if (data) {
      this.authConfig = new AuthConfig(data.auth_config);
      this.displayConfig = new DisplayConfig(data.display_config);
      this.userSettings = new UserSettings(data.user_settings);
      this.organizationSettings = new OrganizationSettings(data.organization_settings);
      this.maintenanceMode = data.maintenance_mode;
    }
    return this;
  }

  public __internal_toSnapshot(): EnvironmentJSONSnapshot {
    return {
      object: 'environment',
      id: this.id || '',
      auth_config: this.authConfig.__internal_toSnapshot(),
      display_config: this.displayConfig.__internal_toSnapshot(),
      user_settings: this.userSettings.__internal_toSnapshot(),
      organization_settings: this.organizationSettings.__internal_toSnapshot(),
      maintenance_mode: this.maintenanceMode,
    };
  }
}
