import type { CommerceSettingsJSON, CommerceSettingsJSONSnapshot, CommerceSettingsResource } from '@clerk/types';

import { BaseResource } from './internal';

/**
 * @internal
 */
export class CommerceSettings extends BaseResource implements CommerceSettingsResource {
  billing: CommerceSettingsResource['billing'] = {
    stripePublishableKey: '',
    freeTrialRequiresPaymentMethod: true,
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

    this.billing.stripePublishableKey = data.billing.stripe_publishable_key || '';
    this.billing.freeTrialRequiresPaymentMethod = data.billing.free_trial_requires_payment_method ?? true;
    this.billing.organization.enabled = data.billing.organization.enabled || false;
    this.billing.organization.hasPaidPlans = data.billing.organization.has_paid_plans || false;
    this.billing.user.enabled = data.billing.user.enabled || false;
    this.billing.user.hasPaidPlans = data.billing.user.has_paid_plans || false;

    return this;
  }

  public __internal_toSnapshot(): CommerceSettingsJSONSnapshot {
    return {
      billing: {
        stripe_publishable_key: this.billing.stripePublishableKey,
        free_trial_requires_payment_method: this.billing.freeTrialRequiresPaymentMethod,
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
