import type { APIKeysSettingsJSON, APIKeysSettingsJSONSnapshot, APIKeysSettingsResource } from '@clerk/types';

import { BaseResource } from './internal';
import { parseJSON } from './parser';

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

    Object.assign(
      this,
      parseJSON<APIKeysSettingsResource>(data, {
        defaultValues: {
          enabled: false,
        },
      }),
    );
    return this;
  }

  public __internal_toSnapshot(): APIKeysSettingsJSONSnapshot {
    return {
      enabled: this.enabled,
    } as APIKeysSettingsJSONSnapshot;
  }
}
