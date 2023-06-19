import type { ClerkResourceJSON } from './json';
import type { ClerkResource } from './resource';

export interface OrganizationSettingsJSON extends ClerkResourceJSON {
  id: never;
  object: never;
  enabled: boolean;
  max_allowed_memberships: number;
  actions: {
    admin_delete: boolean;
  };
}

export interface OrganizationSettingsResource extends ClerkResource {
  enabled: boolean;
  maxAllowedMemberships: number;
  actions: {
    adminDelete: boolean;
  };
}
