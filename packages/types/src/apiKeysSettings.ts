import type { ClerkResourceJSON } from './json';
import type { ClerkResource } from './resource';
import type { APIKeysSettingsJSONSnapshot } from './snapshots';

export interface APIKeysSettingsJSON extends ClerkResourceJSON {
  enabled: boolean;
}

export interface APIKeysSettingsResource extends ClerkResource {
  enabled: boolean;

  __internal_toSnapshot: () => APIKeysSettingsJSONSnapshot;
}
