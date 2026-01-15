import type { ClerkResourceJSON } from './json';
import type { OrganizationEnrollmentMode } from './organizationDomain';
import type { ClerkResource } from './resource';
import type { OrganizationSettingsJSONSnapshot } from './snapshots';

export interface OrganizationSettingsJSON extends ClerkResourceJSON {
  id: never;
  object: never;
  enabled: boolean;
  max_allowed_memberships: number;
  force_organization_selection: boolean;
  actions: {
    admin_delete: boolean;
  };
  domains: {
    enabled: boolean;
    enrollment_modes: OrganizationEnrollmentMode[];
    default_role: string | null;
  };
  slug: {
    disabled: boolean;
  };
  organization_creation_defaults: {
    enabled: boolean;
  };
}

export interface OrganizationSettingsResource extends ClerkResource {
  enabled: boolean;
  maxAllowedMemberships: number;
  forceOrganizationSelection: boolean;
  actions: {
    adminDelete: boolean;
  };
  domains: {
    enabled: boolean;
    enrollmentModes: OrganizationEnrollmentMode[];
    defaultRole: string | null;
  };
  slug: {
    disabled: boolean;
  };
  __internal_toSnapshot: () => OrganizationSettingsJSONSnapshot;
}
