import type {
  InvitationStatus,
  OrganizationInvitationStatus,
  OrganizationMembershipRole,
  SignInStatus,
  SignUpStatus,
} from './Enums';

export const ObjectType = {
  AllowlistIdentifier: 'allowlist_identifier',
  Client: 'client',
  Email: 'email',
  EmailAddress: 'email_address',
  ExternalAccount: 'external_account',
  FacebookAccount: 'facebook_account',
  GoogleAccount: 'google_account',
  Invitation: 'invitation',
  OauthAccessToken: 'oauth_access_token',
  Organization: 'organization',
  OrganizationInvitation: 'organization_invitation',
  OrganizationMembership: 'organization_membership',
  PhoneNumber: 'phone_number',
  RedirectUrl: 'redirect_url',
  SamlAccount: 'saml_account',
  Session: 'session',
  SignInAttempt: 'sign_in_attempt',
  SignInToken: 'sign_in_token',
  SignUpAttempt: 'sign_up_attempt',
  SmsMessage: 'sms_message',
  User: 'user',
  Web3Wallet: 'web3_wallet',
  Token: 'token',
  TotalCount: 'total_count',
  TestingToken: 'testing_token',
} as const;

export type ObjectType = (typeof ObjectType)[keyof typeof ObjectType];

export interface ClerkResourceJSON {
  object: ObjectType;
  id: string;
}

export interface TokenJSON {
  object: typeof ObjectType.Token;
  jwt: string;
}

export interface AllowlistIdentifierJSON extends ClerkResourceJSON {
  object: typeof ObjectType.AllowlistIdentifier;
  identifier: string;
  created_at: number;
  updated_at: number;
  invitation_id?: string;
}

export interface ClientJSON extends ClerkResourceJSON {
  object: typeof ObjectType.Client;
  session_ids: string[];
  sessions: SessionJSON[];
  sign_in_id: string | null;
  sign_up_id: string | null;
  last_active_session_id: string | null;
  created_at: number;
  updated_at: number;
}

export interface EmailJSON extends ClerkResourceJSON {
  object: typeof ObjectType.Email;
  slug?: string | null;
  from_email_name: string;
  to_email_address?: string;
  email_address_id: string | null;
  user_id?: string | null;
  subject?: string;
  body?: string;
  body_plain?: string | null;
  status?: string;
  data?: Record<string, any> | null;
  delivered_by_clerk: boolean;
}

export interface EmailAddressJSON extends ClerkResourceJSON {
  object: typeof ObjectType.EmailAddress;
  email_address: string;
  verification: VerificationJSON | null;
  linked_to: IdentificationLinkJSON[];
}

export interface ExternalAccountJSON extends ClerkResourceJSON {
  object: typeof ObjectType.ExternalAccount;
  provider: string;
  identification_id: string;
  provider_user_id: string;
  approved_scopes: string;
  email_address: string;
  first_name: string;
  last_name: string;
  image_url?: string;
  username: string | null;
  public_metadata?: Record<string, unknown> | null;
  label: string | null;
  verification: VerificationJSON | null;
}

export interface SamlAccountJSON extends ClerkResourceJSON {
  object: typeof ObjectType.SamlAccount;
  provider: string;
  provider_user_id: string | null;
  active: boolean;
  email_address: string;
  first_name: string;
  last_name: string;
  verification: VerificationJSON | null;
}

export interface IdentificationLinkJSON extends ClerkResourceJSON {
  type: string;
}

export interface InvitationJSON extends ClerkResourceJSON {
  object: typeof ObjectType.Invitation;
  email_address: string;
  public_metadata: Record<string, unknown> | null;
  revoked?: boolean;
  status: InvitationStatus;
  url?: string;
  created_at: number;
  updated_at: number;
}

export interface OauthAccessTokenJSON {
  external_account_id: string;
  object: typeof ObjectType.OauthAccessToken;
  token: string;
  provider: string;
  public_metadata: Record<string, unknown>;
  label: string | null;
  // Only set in OAuth 2.0 tokens
  scopes?: string[];
  // Only set in OAuth 1.0 tokens
  token_secret?: string;
}

export interface OrganizationJSON extends ClerkResourceJSON {
  object: typeof ObjectType.Organization;
  name: string;
  slug: string;
  image_url?: string;
  has_image: boolean;
  members_count?: number;
  pending_invitations_count?: number;
  max_allowed_memberships: number;
  admin_delete_enabled: boolean;
  public_metadata: OrganizationPublicMetadata | null;
  private_metadata?: OrganizationPrivateMetadata;
  created_by: string;
  created_at: number;
  updated_at: number;
}

export interface OrganizationInvitationJSON extends ClerkResourceJSON {
  email_address: string;
  role: OrganizationMembershipRole;
  organization_id: string;
  public_organization_data?: PublicOrganizationDataJSON | null;
  status?: OrganizationInvitationStatus;
  public_metadata: OrganizationInvitationPublicMetadata;
  private_metadata: OrganizationInvitationPrivateMetadata;
  created_at: number;
  updated_at: number;
}

export interface PublicOrganizationDataJSON extends ClerkResourceJSON {
  name: string;
  slug: string;
  image_url?: string;
  has_image: boolean;
}

export interface OrganizationMembershipJSON extends ClerkResourceJSON {
  object: typeof ObjectType.OrganizationMembership;
  public_metadata: OrganizationMembershipPublicMetadata;
  private_metadata?: OrganizationMembershipPrivateMetadata;
  role: OrganizationMembershipRole;
  permissions: string[];
  created_at: number;
  updated_at: number;
  organization: OrganizationJSON;
  public_user_data: OrganizationMembershipPublicUserDataJSON;
}

export interface OrganizationMembershipPublicUserDataJSON {
  identifier: string;
  first_name: string | null;
  last_name: string | null;
  image_url: string;
  has_image: boolean;
  user_id: string;
}

export interface PhoneNumberJSON extends ClerkResourceJSON {
  object: typeof ObjectType.PhoneNumber;
  phone_number: string;
  reserved_for_second_factor: boolean;
  default_second_factor: boolean;
  reserved: boolean;
  verification: VerificationJSON | null;
  linked_to: IdentificationLinkJSON[];
  backup_codes: string[];
}

export interface RedirectUrlJSON extends ClerkResourceJSON {
  object: typeof ObjectType.RedirectUrl;
  url: string;
  created_at: number;
  updated_at: number;
}

export interface SessionJSON extends ClerkResourceJSON {
  object: typeof ObjectType.Session;
  client_id: string;
  user_id: string;
  status: string;
  last_active_organization_id?: string;
  actor?: Record<string, unknown>;
  last_active_at: number;
  expire_at: number;
  abandon_at: number;
  created_at: number;
  updated_at: number;
}

export interface SignInJSON extends ClerkResourceJSON {
  object: typeof ObjectType.SignInToken;
  status: SignInStatus;
  identifier: string;
  created_session_id: string | null;
}

export interface SignInTokenJSON extends ClerkResourceJSON {
  object: typeof ObjectType.SignInToken;
  user_id: string;
  token: string;
  status: 'pending' | 'accepted' | 'revoked';
  url: string;
  created_at: number;
  updated_at: number;
}

export interface SignUpJSON extends ClerkResourceJSON {
  object: typeof ObjectType.SignUpAttempt;
  status: SignUpStatus;
  username: string | null;
  email_address: string | null;
  phone_number: string | null;
  web3_wallet: string | null;
  web3_wallet_verification: VerificationJSON | null;
  external_account: any;
  has_password: boolean;
  name_full: string | null;
  created_session_id: string | null;
  created_user_id: string | null;
  abandon_at: number | null;
}

export interface SMSMessageJSON extends ClerkResourceJSON {
  object: typeof ObjectType.SmsMessage;
  from_phone_number: string;
  to_phone_number: string;
  phone_number_id: string | null;
  user_id?: string;
  message: string;
  status: string;
  data?: Record<string, any> | null;
  delivered_by_clerk: boolean;
}

export interface UserJSON extends ClerkResourceJSON {
  object: typeof ObjectType.User;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  image_url: string;
  has_image: boolean;
  primary_email_address_id: string | null;
  primary_phone_number_id: string | null;
  primary_web3_wallet_id: string | null;
  password_enabled: boolean;
  two_factor_enabled: boolean;
  totp_enabled: boolean;
  backup_code_enabled: boolean;
  email_addresses: EmailAddressJSON[];
  phone_numbers: PhoneNumberJSON[];
  web3_wallets: Web3WalletJSON[];
  organization_memberships: OrganizationMembershipJSON[] | null;
  external_accounts: ExternalAccountJSON[];
  saml_accounts: SamlAccountJSON[];
  password_last_updated_at: number | null;
  public_metadata: UserPublicMetadata;
  private_metadata: UserPrivateMetadata;
  unsafe_metadata: UserUnsafeMetadata;
  external_id: string | null;
  last_sign_in_at: number | null;
  banned: boolean;
  locked: boolean;
  lockout_expires_in_seconds: number | null;
  verification_attempts_remaining: number | null;
  created_at: number;
  updated_at: number;
  last_active_at: number | null;
  create_organization_enabled: boolean;
  create_organizations_limit: number | null;
}

export interface VerificationJSON extends ClerkResourceJSON {
  status: string;
  strategy: string;
  attempts: number | null;
  expire_at: number | null;
  verified_at_client?: string;
  external_verification_redirect_url?: string | null;
  nonce?: string | null;
}

export interface Web3WalletJSON extends ClerkResourceJSON {
  object: typeof ObjectType.Web3Wallet;
  web3_wallet: string;
  verification: VerificationJSON | null;
}

export interface DeletedObjectJSON {
  object: string;
  id?: string;
  slug?: string;
  deleted: boolean;
}

export interface PaginatedResponseJSON {
  data: object[];
  total_count?: number;
}

export interface SamlConnectionJSON extends ClerkResourceJSON {
  name: string;
  domain: string;
  idp_entity_id: string;
  idp_sso_url: string;
  idp_certificate: string;
  idp_metadata_url: string;
  idp_metadata: string;
  acs_url: string;
  sp_entity_id: string;
  sp_metadata_url: string;
  active: boolean;
  provider: string;
  user_count: number;
  sync_user_attributes: boolean;
  allow_subdomains: boolean;
  allow_idp_initiated: boolean;
  created_at: number;
  updated_at: number;
  attribute_mapping: AttributeMappingJSON;
}

export interface AttributeMappingJSON {
  user_id: string;
  email_address: string;
  first_name: string;
  last_name: string;
}

export interface TestingTokenJSON {
  object: typeof ObjectType.TestingToken;
  token: string;
  expires_at: number;
}
