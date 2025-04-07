import type { __experimental_CommerceSettingsJSONSnapshot } from 'snapshots';

import type { ClerkResourceJSON } from './json';
import type { ClerkResource } from './resource';

export interface __experimental_CommerceSettingsJSON extends ClerkResourceJSON {
  enabled: boolean;
  stripe_publishable_key: string;
}

export interface __experimental_CommerceSettingsResource extends ClerkResource {
  enabled: boolean;
  stripePublishableKey: string;
  __internal_toSnapshot: () => __experimental_CommerceSettingsJSONSnapshot;
}
