import type { CommerceSettingsJSONSnapshot } from 'snapshots';

import type { ClerkResourceJSON } from './json';
import type { ClerkResource } from './resource';

export interface CommerceSettingsJSON extends ClerkResourceJSON {
  billing: {
    enabled: boolean;
    stripe_publishable_key: string;
    has_paid_user_plans: boolean;
    has_paid_org_plans: boolean;
  };
}

export interface CommerceSettingsResource extends ClerkResource {
  billing: {
    enabled: boolean;
    stripePublishableKey: string;
    hasPaidUserPlans: boolean;
    hasPaidOrgPlans: boolean;
  };

  __internal_toSnapshot: () => CommerceSettingsJSONSnapshot;
}
