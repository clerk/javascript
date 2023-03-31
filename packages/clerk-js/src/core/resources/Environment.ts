import type {
  AuthConfigResource,
  DisplayConfigResource,
  EnvironmentJSON,
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

  public static getInstance(): Environment {
    if (!Environment.instance) {
      Environment.instance = new Environment();
    }

    return Environment.instance;
  }

  constructor(data: EnvironmentJSON | null = null) {
    super();
    this.fromJSON(data);
  }

  fetch({ touch = false }: { touch: boolean }): Promise<Environment> {
    if (touch) {
      return this._basePatch({});
    }
    return this._baseGet();
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

  protected fromJSON(data: EnvironmentJSON | null): this {
    if (data) {
      this.authConfig = new AuthConfig(data.auth_config);
      this.displayConfig = new DisplayConfig(data.display_config);
      this.userSettings = new UserSettings(data.user_settings);
      this.organizationSettings = new OrganizationSettings(data.organization_settings);
    }
    return this;
  }
}
