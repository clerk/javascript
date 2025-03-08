import type { CommerceSettingsJSON, CommerceSettingsJSONSnapshot, CommerceSettingsResource } from '@clerk/types';

import { BaseResource } from './internal';

/**
 * @internal
 */
export class CommerceSettings extends BaseResource implements CommerceSettingsResource {
  stripePublishableKey!: string;

  public constructor(data: CommerceSettingsJSON | CommerceSettingsJSONSnapshot) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: CommerceSettingsJSON | CommerceSettingsJSONSnapshot | null): this {
    if (!data) {
      return this;
    }
    this.stripePublishableKey = data.stripe_publishable_key;
    return this;
  }

  public __internal_toSnapshot(): CommerceSettingsJSONSnapshot {
    return {
      stripe_publishable_key: this.stripePublishableKey,
    } as unknown as CommerceSettingsJSONSnapshot;
  }
}
