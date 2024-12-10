import type { ClerkResourceJSON } from './json';
import type { OrganizationEnrollmentMode } from './organizationDomain';
import type { ClerkResource } from './resource';

export interface OrganizationSettingsJSON extends ClerkResourceJSON {
  id: never;
  object: never;
  enabled: boolean;
  max_allowed_memberships: number;
  actions: {
    admin_delete: boolean;
  };
  domains: {
    enabled: boolean;
    enrollment_modes: OrganizationEnrollmentMode[];
    default_role: string | null;
  };
}

export interface OrganizationSettingsResource extends ClerkResource {
  enabled: boolean;
  maxAllowedMemberships: number;
  actions: {
    adminDelete: boolean;
  };
  domains: {
    enabled: boolean;
    enrollmentModes: OrganizationEnrollmentMode[];
    defaultRole: string | null;
  };
  toJSON: () => OrganizationSettingsJSON;
}
