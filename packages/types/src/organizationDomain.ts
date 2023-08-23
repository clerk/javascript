import type { ClerkResource } from './resource';

export interface OrganizationDomainVerification {
  status: OrganizationDomainVerificationStatus;
  strategy: 'email_code'; // only available value for now
  attempts: number;
  expiresAt: Date;
}

export type OrganizationDomainVerificationStatus = 'unverified' | 'verified';

export type OrganizationEnrollmentMode = 'manual_invitation' | 'automatic_invitation' | 'automatic_suggestion';

export interface OrganizationDomainResource extends ClerkResource {
  id: string;
  name: string;
  organizationId: string;
  enrollmentMode: OrganizationEnrollmentMode;
  verification: OrganizationDomainVerification | null;
  createdAt: Date;
  updatedAt: Date;
  affiliationEmailAddress: string | null;
  prepareAffiliationVerification: (params: PrepareAffiliationVerificationParams) => Promise<OrganizationDomainResource>;

  attemptAffiliationVerification: (params: AttemptAffiliationVerificationParams) => Promise<OrganizationDomainResource>;
  delete: () => Promise<void>;
  updateEnrollmentMode: (params: UpdateEnrollmentModeParams) => Promise<OrganizationDomainResource>;
}

export type PrepareAffiliationVerificationParams = {
  affiliationEmailAddress: string;
};

export type AttemptAffiliationVerificationParams = {
  code: string;
};

export type UpdateEnrollmentModeParams = Pick<OrganizationDomainResource, 'enrollmentMode'> & {
  deleteExisting?: boolean;
};
