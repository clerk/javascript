import type { ClerkResourceJSON } from './json';
import type { ClerkResource } from './resource';
import type { CommerceSettingsJSONSnapshot } from './snapshots';

export interface CommerceSettingsJSON extends ClerkResourceJSON {
  billing: {
    stripe_publishable_key: string | null;
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
    stripePublishableKey: string | null;
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
