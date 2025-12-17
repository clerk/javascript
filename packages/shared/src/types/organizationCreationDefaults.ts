import type { ClerkResourceJSON } from './json';
import type { ClerkResource } from './resource';

export type OrganizationCreationAdvisoryType = 'existing_org_with_domain';

export type OrganizationCreationAdvisorySeverity = 'warning';

export interface OrganizationCreationDefaultsJSON extends ClerkResourceJSON {
  advisory: {
    type: OrganizationCreationAdvisoryType;
    severity: OrganizationCreationAdvisorySeverity;
  } | null;
  form: {
    name: string;
    slug: string;
  };
}

export interface OrganizationCreationDefaultsResource extends ClerkResource {
  advisory: {
    type: OrganizationCreationAdvisoryType;
    severity: OrganizationCreationAdvisorySeverity;
  } | null;
  form: {
    name: string;
    slug: string;
  };
}
