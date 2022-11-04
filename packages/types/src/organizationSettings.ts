import { ClerkResourceJSON } from './json';
import { ClerkResource } from './resource';

export interface OrganizationSettingsJSON extends ClerkResourceJSON {
  id: never;
  object: never;
  enabled: boolean;
  max_allowed_memberships: number;
}

export interface OrganizationSettingsResource extends ClerkResource {
  enabled: boolean;
  maxAllowedMemberships: number;
}
