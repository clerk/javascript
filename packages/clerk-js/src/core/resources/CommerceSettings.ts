import type { CommerceSettingsJSON, CommerceSettingsJSONSnapshot, CommerceSettingsResource } from '@clerk/types';

import { BaseResource } from './internal';

/**
 * @internal
 */
export class CommerceSettings extends BaseResource implements CommerceSettingsResource {
  billing: CommerceSettingsResource['billing'] = {
    stripePublishableKey: '',
    enabled: false,
    hasPaidUserPlans: false,
    hasPaidOrgPlans: false,
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
    this.billing.enabled = data.billing.enabled || false;
    this.billing.hasPaidUserPlans = data.billing.has_paid_user_plans || false;
    this.billing.hasPaidOrgPlans = data.billing.has_paid_org_plans || false;
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
        enabled: this.billing.enabled,
        has_paid_user_plans: this.billing.hasPaidUserPlans,
        has_paid_org_plans: this.billing.hasPaidOrgPlans,
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
