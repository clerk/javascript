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
  maintenanceMode!: boolean;

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

    const search = new URLSearchParams();
    if (typeof BaseResource.clerk.__internal_getFrameworkHint === 'function') {
      const { framework, version } = BaseResource.clerk.__internal_getFrameworkHint();
      if (framework) {
        search.append('__clerk_framework_hint', framework);
        version && search.append('__clerk_framework_version', version);
      }
    }

    return this._baseGet({ search });
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
      this.maintenanceMode = data.maintenance_mode;
    }
    return this;
  }
}
