import type { CommerceSettingsJSON, CommerceSettingsJSONSnapshot, CommerceSettingsResource } from '@clerk/shared/types';

import { BaseResource } from './Base';

/**
 * @internal
 */
export class CommerceSettings extends BaseResource implements CommerceSettingsResource {
  billing: CommerceSettingsResource['billing'] = {
    stripePublishableKey: null,
    organization: {
      enabled: false,
      hasPaidPlans: false,
    },
    user: {
      enabled: false,
      hasPaidPlans: false,
    },
  };

  public constructor(data: CommerceSettingsJSON | CommerceSettingsJSONSnapshot | null = null) {
    super();
    this.fromJSON(data);
  }

  protected fromJSON(data: CommerceSettingsJSON | CommerceSettingsJSONSnapshot | null): this {
    if (!data) {
      return this;
    }

    this.billing.stripePublishableKey = data.billing.stripe_publishable_key;
    this.billing.organization.enabled = data.billing.organization.enabled;
    this.billing.organization.hasPaidPlans = data.billing.organization.has_paid_plans;
    this.billing.user.enabled = data.billing.user.enabled;
    this.billing.user.hasPaidPlans = data.billing.user.has_paid_plans;

    return this;
  }

  public __internal_toSnapshot(): CommerceSettingsJSONSnapshot {
    return {
      billing: {
        stripe_publishable_key: this.billing.stripePublishableKey,
        organization: {
          enabled: this.billing.organization.enabled,
          has_paid_plans: this.billing.organization.hasPaidPlans,
        },
        user: {
          enabled: this.billing.user.enabled,
          has_paid_plans: this.billing.user.hasPaidPlans,
        },
      },
    } as unknown as CommerceSettingsJSONSnapshot;
  }
}
