import type { ClerkResourceJSON } from './json';
import type { ClerkResource } from './resource';

export type OrganizationCreationAdvisoryType = 'existing_org_with_domain';

export type OrganizationCreationAdvisorySeverity = 'warning';

export interface OrganizationCreationDefaultsJSON extends ClerkResourceJSON {
  creation_advisory: {
    type: OrganizationCreationAdvisoryType;
    severity: OrganizationCreationAdvisorySeverity;
  } | null;
}

export interface OrganizationCreationDefaultsResource extends ClerkResource {
  creationAdvisory: {
    type: OrganizationCreationAdvisoryType;
    severity: OrganizationCreationAdvisorySeverity;
  } | null;
}
