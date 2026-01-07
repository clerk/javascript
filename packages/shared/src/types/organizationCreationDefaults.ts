import type { ClerkResourceJSON } from './json';
import type { ClerkResource } from './resource';

export type OrganizationCreationAdvisoryType = 'organization_already_exists';

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
    blur_hash: string | null;
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
    blurHash: string | null;
  };
}
