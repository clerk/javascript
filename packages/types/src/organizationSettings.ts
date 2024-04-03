import type { BillingData } from './billing';
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
  billing: BillingData;
  domains: {
    enabled: boolean;
    enrollment_modes: OrganizationEnrollmentMode[];
  };
}

export interface OrganizationSettingsResource extends ClerkResource {
  enabled: boolean;
  maxAllowedMemberships: number;
  actions: {
    adminDelete: boolean;
  };
  billing: BillingData;
  domains: {
    enabled: boolean;
    enrollmentModes: OrganizationEnrollmentMode[];
  };
}
