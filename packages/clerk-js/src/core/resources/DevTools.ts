import type { ClerkResourceJSON, DevToolsResource, EnableEnvironmentSettingParams } from '@clerk/shared/types';

import { BaseResource } from './Base';

/**
 * @internal
 */
export class DevTools extends BaseResource implements DevToolsResource {
  pathRoot = '/dev_tools';

  protected fromJSON(_data: ClerkResourceJSON | null): this {
    return this;
  }

  async __internal_enableEnvironmentSetting(params: EnableEnvironmentSettingParams) {
    await this._basePatch({
      path: `${this.pathRoot}/enable_environment_setting`,
      body: params,
    });
  }
}
