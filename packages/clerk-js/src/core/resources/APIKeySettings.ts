import type { APIKeysSettingsJSON, APIKeysSettingsJSONSnapshot, APIKeysSettingsResource } from '@clerk/shared/types';

import { BaseResource } from './internal';

/**
 * @internal
 */
export class APIKeySettings extends BaseResource implements APIKeysSettingsResource {
  user_api_keys_enabled: boolean = false;
  show_in_user_profile: boolean = false;
  orgs_api_keys_enabled: boolean = false;
  show_in_org_profile: boolean = false;

  public constructor(data: APIKeysSettingsJSON | APIKeysSettingsJSONSnapshot | null = null) {
    super();

    this.fromJSON(data);
  }

  protected fromJSON(data: APIKeysSettingsJSON | APIKeysSettingsJSONSnapshot | null): this {
    if (!data) {
      return this;
    }

    this.user_api_keys_enabled = this.withDefault(data.user_api_keys_enabled, false);
    this.show_in_user_profile = this.withDefault(data.show_in_user_profile, false);
    this.orgs_api_keys_enabled = this.withDefault(data.orgs_api_keys_enabled, false);
    this.show_in_org_profile = this.withDefault(data.show_in_org_profile, false);

    return this;
  }

  public __internal_toSnapshot(): APIKeysSettingsJSONSnapshot {
    return {
      user_api_keys_enabled: this.user_api_keys_enabled,
      show_in_user_profile: this.show_in_user_profile,
      orgs_api_keys_enabled: this.orgs_api_keys_enabled,
      show_in_org_profile: this.show_in_org_profile,
    } as APIKeysSettingsJSONSnapshot;
  }
}
