import type { CommerceSettingsJSONSnapshot } from 'snapshots';

import type { ClerkResourceJSON } from './json';
import type { ClerkResource } from './resource';

export interface CommerceSettingsJSON extends ClerkResourceJSON {
  stripe_publishable_key: string;
}

export interface CommerceSettingsResource extends ClerkResource {
  stripePublishableKey: string;
  __internal_toSnapshot: () => CommerceSettingsJSONSnapshot;
}
