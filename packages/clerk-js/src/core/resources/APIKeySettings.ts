import type { APIKeysSettingsJSON, APIKeysSettingsJSONSnapshot, APIKeysSettingsResource } from '@clerk/types';

import { BaseResource } from './internal';

/**
 * @internal
 */
export class APIKeySettings extends BaseResource implements APIKeysSettingsResource {
  enabled: boolean = false;

  public constructor(data: APIKeysSettingsJSON | APIKeysSettingsJSONSnapshot | null = null) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: APIKeysSettingsJSON | APIKeysSettingsJSONSnapshot | null): this {
    if (!data) {
      return this;
    }

    this.enabled = this.withDefault(data.enabled, false);

    return this;
  }

  public __internal_toSnapshot(): APIKeysSettingsJSONSnapshot {
    return {
      enabled: this.enabled,
    } as APIKeysSettingsJSONSnapshot;
  }
}
