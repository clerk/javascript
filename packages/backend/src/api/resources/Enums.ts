import type { AgentActionStatus as SharedAgentActionStatus, OrganizationCustomRoleKey } from '@clerk/shared/types';

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

/** @inline */
export type OrganizationInvitationStatus = 'pending' | 'accepted' | 'revoked' | 'expired';

/** @inline */
export type OrganizationDomainVerificationStatus = 'unverified' | 'verified';

/** @inline */
export type OrganizationDomainVerificationStrategy = 'email_code'; // only available value for now

/** @inline */
export type OrganizationEnrollmentMode = 'manual_invitation' | 'automatic_invitation' | 'automatic_suggestion';

/** @inline */
export type OrganizationMembershipRole = OrganizationCustomRoleKey;

export type SignInStatus = 'needs_identifier' | 'needs_factor_one' | 'needs_factor_two' | 'complete';

export type SignUpVerificationNextAction = 'needs_prepare' | 'needs_attempt' | '';

/** @inline */
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

/** @inline */
export type AllowlistIdentifierType = 'email_address' | 'phone_number' | 'web3_wallet';

/** @inline */
export type BlocklistIdentifierType = AllowlistIdentifierType;

/** @inline */
export type WaitlistEntryStatus = 'pending' | 'invited' | 'completed' | 'rejected';

/**
 * The lifecycle status of an Agent Action. `pending` is the only non-terminal value.
 *
 * Aliased rather than redeclared: the union is owned by `@clerk/shared` so this package
 * and the approval review surface cannot drift. The local name disambiguates it from the
 * `AgentActionStatus` resource class, which is the slim status view, not a status value.
 *
 * @experimental This is an experimental API and is subject to change.
 * @inline
 */
export type AgentActionStatusValue = SharedAgentActionStatus;

/**
 * What the policy engine decided. Distinct from the lifecycle status: a fail-closed
 * downgrade produces `require_approval` on an Agent Action whose status is `denied`.
 *
 * @experimental This is an experimental API and is subject to change.
 * @inline
 */
export type AgentActionEffect = 'allow' | 'deny' | 'require_approval';

/**
 * Whether the policy document evaluated cleanly. `error` means at least one rule
 * was skipped, and the reasons are listed in `evaluationErrors`.
 *
 * @experimental This is an experimental API and is subject to change.
 * @inline
 */
export type AgentActionEvaluation = 'ok' | 'error';
