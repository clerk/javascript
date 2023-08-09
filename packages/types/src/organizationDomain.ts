import type { ClerkResource } from './resource';

export interface OrganizationDomainVerification {
  status: OrganizationDomainVerificationStatus;
  strategy: 'email_code'; // only available value for now
  attempts: number;
  expiresAt: Date;
}

export type OrganizationDomainVerificationStatus = 'unverified' | 'verified';

export type OrganizationEnrollmentMode = 'manual_invitation' | 'automatic_invitation';

export interface OrganizationDomainResource extends ClerkResource {
  id: string;
  name: string;
  organizationId: string;
  enrollmentMode: OrganizationEnrollmentMode;
  verification: OrganizationDomainVerification | null;
  createdAt: Date;
  updatedAt: Date;
  affiliationEmailAddress: string | null;
  prepareDomainAffiliationVerification: (
    params: PrepareAffiliationVerificationParams,
  ) => Promise<OrganizationDomainResource>;

  attemptAffiliationVerification: (params: AttemptAffiliationVerificationParams) => Promise<OrganizationDomainResource>;
  delete: () => Promise<void>;
  update: (params: UpdateOrganizationDomainParams) => Promise<OrganizationDomainResource>;
}

export type PrepareAffiliationVerificationParams = {
  affiliationEmailAddress: string;
};

export type AttemptAffiliationVerificationParams = {
  emailAddress: string;
};

export type UpdateOrganizationDomainParams = Partial<Pick<OrganizationDomainResource, 'enrollmentMode'>>;
