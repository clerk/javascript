import type { ClerkResourceJSON } from './json';
import type { ClerkResource } from './resource';

export type OrganizationCreationAdvisoryType = 'existing_org_with_domain';

export type OrganizationCreationAdvisorySeverity = 'warning';

export interface OrganizationCreationDefaultsJSON extends ClerkResourceJSON {
  advisory: {
    code: OrganizationCreationAdvisoryType;
    severity: OrganizationCreationAdvisorySeverity;
    meta: Record<string, string>;
  } | null;
  form: {
    name: string;
    slug: string;
    logo: string | null;
  };
}

export interface OrganizationCreationDefaultsResource extends ClerkResource {
  advisory: {
    code: OrganizationCreationAdvisoryType;
    severity: OrganizationCreationAdvisorySeverity;
    meta: Record<string, string>;
  } | null;
  form: {
    name: string;
    slug: string;
    logo: string | null;
  };
}
