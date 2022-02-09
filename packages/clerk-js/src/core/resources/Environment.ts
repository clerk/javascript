import type {
  AuthConfigResource,
  DisplayConfigResource,
  EnvironmentJSON,
  EnvironmentResource,
  UserSettingsResource,
} from '@clerk/types';

import { AuthConfig } from './AuthConfig';
import { BaseResource } from './Base';
import { DisplayConfig } from './DisplayConfig';
import { UserSettings } from './UserSettings';

export class Environment extends BaseResource implements EnvironmentResource {
  private static instance: Environment;

  pathRoot = '/environment';
  authConfig!: AuthConfigResource;
  displayConfig!: DisplayConfigResource;
  userSettings!: UserSettingsResource;

  public static getInstance(): Environment {
    if (!Environment.instance) {
      Environment.instance = new Environment();
    }

    return Environment.instance;
  }

  private constructor(data: EnvironmentJSON | null = null) {
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

  onWindowLocationHost = (): boolean => {
    return this.displayConfig.backendHost === window.location.host;
  };

  protected fromJSON(data: EnvironmentJSON | null): this {
    if (data) {
      this.authConfig = new AuthConfig(data.auth_config);
      this.displayConfig = new DisplayConfig(data.display_config);
      this.userSettings = new UserSettings(data.user_settings);
    }
    return this;
  }
}
