import type {
  AuthConfigResource,
  CommerceSettingsResource,
  DisplayConfigResource,
  EnvironmentJSON,
  EnvironmentJSONSnapshot,
  EnvironmentResource,
  OrganizationSettingsResource,
  UserSettingsResource,
} from '@clerk/types';

import { eventBus, events } from '../../core/events';
import { APIKeySettings } from './APIKeySettings';
import { AuthConfig, BaseResource, CommerceSettings, DisplayConfig, UserSettings } from './internal';
import { OrganizationSettings } from './OrganizationSettings';
import { parseJSON } from './parser';

export class Environment extends BaseResource implements EnvironmentResource {
  private static instance: Environment;

  authConfig: AuthConfigResource = new AuthConfig();
  displayConfig: DisplayConfigResource = new DisplayConfig();
  maintenanceMode: boolean = false;
  pathRoot = '/environment';
  userSettings: UserSettingsResource = new UserSettings();
  organizationSettings: OrganizationSettingsResource = new OrganizationSettings();
  commerceSettings: CommerceSettingsResource = new CommerceSettings();
  apiKeysSettings: APIKeySettings = new APIKeySettings();

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
    Object.assign(
      this,
      parseJSON<Environment>(data, {
        nestedFields: {
          authConfig: AuthConfig,
          displayConfig: DisplayConfig,
          organizationSettings: OrganizationSettings,
          userSettings: UserSettings,
          commerceSettings: CommerceSettings,
          apiKeysSettings: APIKeySettings,
        },
        defaultValues: {
          maintenanceMode: false,
        },
      }),
    );
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
      organization_settings: this.organizationSettings.__internal_toSnapshot(),
      user_settings: this.userSettings.__internal_toSnapshot(),
      commerce_settings: this.commerceSettings.__internal_toSnapshot(),
      api_keys_settings: this.apiKeysSettings.__internal_toSnapshot(),
    };
  }
}
