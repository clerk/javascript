import type { OrganizationCustomRoleKey } from '@clerk/shared/types';

export type OAuthProvider =
  | 'facebook'
  | 'google'
  | 'hubspot'
  | 'github'
  | 'tiktok'
  | 'gitlab'
  | 'discord'
  | 'twitter'
  | 'twitch'
  | 'linkedin'
  | 'linkedin_oidc'
  | 'dropbox'
  | 'bitbucket'
  | 'microsoft'
  | 'notion'
  | 'apple'
  | 'x';

export type OAuthStrategy = `oauth_${OAuthProvider}`;

/**
 * @inline
 */
export type OrganizationInvitationStatus = 'pending' | 'accepted' | 'revoked';

export type OrganizationDomainVerificationStatus = 'unverified' | 'verified';

export type OrganizationDomainVerificationStrategy = 'email_code'; // only available value for now

export type OrganizationEnrollmentMode = 'manual_invitation' | 'automatic_invitation' | 'automatic_suggestion';

export type OrganizationMembershipRole = OrganizationCustomRoleKey;

export type SignInStatus = 'needs_identifier' | 'needs_factor_one' | 'needs_factor_two' | 'complete';

export type SignUpVerificationNextAction = 'needs_prepare' | 'needs_attempt' | '';

/**
 * @inline
 */
export type InvitationStatus = 'pending' | 'accepted' | 'revoked' | 'expired';

export const DomainsEnrollmentModes = {
  ManualInvitation: 'manual_invitation',
  AutomaticInvitation: 'automatic_invitation',
  AutomaticSuggestion: 'automatic_suggestion',
} as const;
export type DomainsEnrollmentModes = (typeof DomainsEnrollmentModes)[keyof typeof DomainsEnrollmentModes];

export const ActorTokenStatus = {
  Pending: 'pending',
  Accepted: 'accepted',
  Revoked: 'revoked',
} as const;
export type ActorTokenStatus = (typeof ActorTokenStatus)[keyof typeof ActorTokenStatus];

/**
 * @inline
 */
export type AllowlistIdentifierType = 'email_address' | 'phone_number' | 'web3_wallet';

/**
 * @inline
 */
export type BlocklistIdentifierType = AllowlistIdentifierType;

/**
 * @inline
 */
export type WaitlistEntryStatus = 'pending' | 'invited' | 'completed' | 'rejected';
