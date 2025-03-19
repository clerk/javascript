import type { __experimental_CommerceSettingsJSONSnapshot } from 'snapshots';

import type { ClerkResourceJSON } from './json';
import type { ClerkResource } from './resource';

export interface __experimental_CommerceSettingsJSON extends ClerkResourceJSON {
  stripe_publishable_key: string;
}

export interface __experimental_CommerceSettingsResource extends ClerkResource {
  stripePublishableKey: string;
  __internal_toSnapshot: () => __experimental_CommerceSettingsJSONSnapshot;
}
