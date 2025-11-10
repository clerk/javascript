import type { APIKeysSettingsJSON, APIKeysSettingsJSONSnapshot, APIKeysSettingsResource } from '@clerk/shared/types';

import { BaseResource } from './internal';

/**
 * @internal
 */
export class APIKeySettings extends BaseResource implements APIKeysSettingsResource {
  public user_api_keys_enabled: boolean = false;
  public orgs_api_keys_enabled: boolean = false;

  public constructor(data: APIKeysSettingsJSON | APIKeysSettingsJSONSnapshot | null = null) {
    super();

    this.fromJSON(data);
  }

  protected fromJSON(data: APIKeysSettingsJSON | APIKeysSettingsJSONSnapshot | null): this {
    if (!data) {
      return this;
    }

    this.user_api_keys_enabled = data.user_api_keys_enabled;
    this.orgs_api_keys_enabled = data.orgs_api_keys_enabled;

    return this;
  }

  public __internal_toSnapshot(): APIKeysSettingsJSONSnapshot {
    return {
      user_api_keys_enabled: this.user_api_keys_enabled,
      orgs_api_keys_enabled: this.orgs_api_keys_enabled,
    } as APIKeysSettingsJSONSnapshot;
  }
}
