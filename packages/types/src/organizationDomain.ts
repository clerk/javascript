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
  delete: () => Promise<void>;
  update: (params: UpdateOrganizationDomainParams) => Promise<OrganizationDomainResource>;
}

export type UpdateOrganizationDomainParams = Partial<Pick<OrganizationDomainResource, 'enrollmentMode'>>;
