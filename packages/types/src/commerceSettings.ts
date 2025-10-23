import type { ClerkResourceJSON } from './json';
import type { ClerkResource } from './resource';
import type { CommerceSettingsJSONSnapshot } from './snapshots';

export interface CommerceSettingsJSON extends ClerkResourceJSON {
  billing: {
    stripe_publishable_key: string;
    free_trial_requires_payment_method?: boolean;
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
    stripePublishableKey: string;
    /**
     * Whether payment methods are required when starting a free trial.
     * When false, users can start free trials without providing payment methods.
     * @default true
     */
    freeTrialRequiresPaymentMethod: boolean;
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
