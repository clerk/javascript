import type { OrganizationCustomRoleKey } from '@clerk/types';

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

export type OrganizationInvitationStatus = 'pending' | 'accepted' | 'revoked';

export type OrganizationMembershipRole = OrganizationCustomRoleKey;

export type SignInStatus = 'needs_identifier' | 'needs_factor_one' | 'needs_factor_two' | 'complete';

export type SignUpStatus = 'missing_requirements' | 'complete' | 'abandoned';

export type InvitationStatus = 'pending' | 'accepted' | 'revoked';
