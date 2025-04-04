import type { OrganizationCustomRoleKey } from '@clerk/types';

export type OrganizationInvitationStatus = 'pending' | 'accepted' | 'revoked';

export type OrganizationDomainVerificationStatus = 'unverified' | 'verified';

export type OrganizationDomainVerificationStrategy = 'email_code'; // only available value for now

export type OrganizationEnrollmentMode = 'manual_invitation' | 'automatic_invitation' | 'automatic_suggestion';

export type OrganizationMembershipRole = OrganizationCustomRoleKey;

export type SignInStatus = 'needs_identifier' | 'needs_factor_one' | 'needs_factor_two' | 'complete';
