import type { CommerceSettingsJSON, CommerceSettingsJSONSnapshot, CommerceSettingsResource } from '@clerk/types';

import { BaseResource } from './internal';
import { parseJSON, serializeToJSON } from './parser';

/**
 * @internal
 */
export class CommerceSettings extends BaseResource implements CommerceSettingsResource {
  billing: CommerceSettingsResource['billing'] = {
    stripePublishableKey: '',
    enabled: false,
    hasPaidUserPlans: false,
    hasPaidOrgPlans: false,
  };

  public constructor(data: CommerceSettingsJSON | CommerceSettingsJSONSnapshot | null = null) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: CommerceSettingsJSON | CommerceSettingsJSONSnapshot | null): this {
    Object.assign(
      this,
      parseJSON<CommerceSettingsResource>(data, {
        customTransforms: {
          billing: value => ({
            stripePublishableKey: value.stripe_publishable_key || '',
            enabled: value.enabled || false,
            hasPaidUserPlans: value.has_paid_user_plans || false,
            hasPaidOrgPlans: value.has_paid_org_plans || false,
          }),
        },
      }),
    );
    return this;
  }

  public __internal_toSnapshot(): CommerceSettingsJSONSnapshot {
    return {
      ...serializeToJSON(this),
    } as unknown as CommerceSettingsJSONSnapshot;
  }
}
