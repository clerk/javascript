import type {
  __experimental_CommerceSettingsJSON,
  __experimental_CommerceSettingsJSONSnapshot,
  __experimental_CommerceSettingsResource,
} from '@clerk/types';

import { BaseResource } from './internal';

/**
 * @internal
 */
export class __experimental_CommerceSettings extends BaseResource implements __experimental_CommerceSettingsResource {
  stripePublishableKey: string = '';

  public constructor(
    data: __experimental_CommerceSettingsJSON | __experimental_CommerceSettingsJSONSnapshot | null = null,
  ) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(
    data: __experimental_CommerceSettingsJSON | __experimental_CommerceSettingsJSONSnapshot | null,
  ): this {
    if (!data) {
      return this;
    }
    this.stripePublishableKey = data.stripe_publishable_key;
    return this;
  }

  public __internal_toSnapshot(): __experimental_CommerceSettingsJSONSnapshot {
    return {
      stripe_publishable_key: this.stripePublishableKey,
    } as unknown as __experimental_CommerceSettingsJSONSnapshot;
  }
}
