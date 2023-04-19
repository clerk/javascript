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
  | 'dropbox'
  | 'bitbucket'
  | 'microsoft'
  | 'notion'
  | 'apple';

export type OAuthStrategy = `oauth_${OAuthProvider}`;

export type OrganizationInvitationStatus = 'pending' | 'accepted' | 'revoked';

export type OrganizationMembershipRole = 'basic_member' | 'guest_member' | 'admin';

export type SignInStatus = 'needs_identifier' | 'needs_factor_one' | 'needs_factor_two' | 'complete';

export type SignUpStatus = 'missing_requirements' | 'complete' | 'abandoned';

export type SignUpAttributeRequirements = (
  | 'name_title'
  | 'name_middle'
  | 'name_last'
  | 'name_suffix'
  | 'age'
  | 'gender'
)[][];

export type InvitationStatus = 'pending' | 'accepted' | 'revoked';
