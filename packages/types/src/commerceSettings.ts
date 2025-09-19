import type { ClerkResourceJSON } from './json';
import type { ClerkResource } from './resource';
import type { CommerceSettingsJSONSnapshot } from './snapshots';

export interface CommerceSettingsJSON extends ClerkResourceJSON {
  billing: {
    enabled: boolean;
    stripe_publishable_key: string;
    has_paid_user_plans: boolean;
    has_paid_org_plans: boolean;
    organization: {
      enabled: boolean;
      has_paid_plans: boolean;
    };
    user: {
      enabled: boolean;
      has_paid_plans: boolean;
    };
  };
}

export interface CommerceSettingsResource extends ClerkResource {
  billing: {
    enabled: boolean;
    stripePublishableKey: string;
    hasPaidUserPlans: boolean;
    hasPaidOrgPlans: boolean;
    organization: {
      enabled: boolean;
      hasPaidPlans: boolean;
    };
    user: {
      enabled: boolean;
      hasPaidPlans: boolean;
    };
  };

  __internal_toSnapshot: () => CommerceSettingsJSONSnapshot;
}
