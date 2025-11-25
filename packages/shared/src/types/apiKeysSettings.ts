import type { ClerkResourceJSON } from './json';
import type { ClerkResource } from './resource';
import type { APIKeysSettingsJSONSnapshot } from './snapshots';

export interface APIKeysSettingsJSON extends ClerkResourceJSON {
  user_api_keys_enabled: boolean;
  orgs_api_keys_enabled: boolean;
}

export interface APIKeysSettingsResource extends ClerkResource {
  user_api_keys_enabled: boolean;
  orgs_api_keys_enabled: boolean;

  __internal_toSnapshot: () => APIKeysSettingsJSONSnapshot;
}
