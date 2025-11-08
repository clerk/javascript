import type { ClerkResourceJSON } from './json';
import type { ClerkResource } from './resource';
import type { APIKeysSettingsJSONSnapshot } from './snapshots';

export interface APIKeysSettingsJSON extends ClerkResourceJSON {
  enabled: boolean;
  user_api_keys_enabled: boolean;
  show_in_user_profile: boolean;
  orgs_api_keys_enabled: boolean;
  show_in_org_profile: boolean;
}

export interface APIKeysSettingsResource extends ClerkResource {
  enabled: boolean;
  user_api_keys_enabled: boolean;
  show_in_user_profile: boolean;
  orgs_api_keys_enabled: boolean;
  show_in_org_profile: boolean;

  __internal_toSnapshot: () => APIKeysSettingsJSONSnapshot;
}
