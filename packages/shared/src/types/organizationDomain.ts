import type { ClerkResource } from './resource';

export interface OrganizationDomainVerification {
  status: OrganizationDomainVerificationStatus;
  strategy: 'email_code'; // only available value for now
  attempts: number;
  expiresAt: Date;
}

/**
 * @inline
 */
export type OrganizationDomainVerificationStatus = 'unverified' | 'verified';

/**
 * @inline
 */
export type OrganizationEnrollmentMode = 'manual_invitation' | 'automatic_invitation' | 'automatic_suggestion';

/**
 * The `OrganizationDomain` object is the model around an Organization domain.
 * @interface
 */
export interface OrganizationDomainResource extends ClerkResource {
  id: string;
  name: string;
  organizationId: string;
  enrollmentMode: OrganizationEnrollmentMode;
  verification: OrganizationDomainVerification | null;
  createdAt: Date;
  updatedAt: Date;
  affiliationEmailAddress: string | null;
  totalPendingInvitations: number;
  totalPendingSuggestions: number;
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
  deletePending?: boolean;
};
