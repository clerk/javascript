import type { LastAuthenticationStrategy, SignUpStatus, VerificationStatus } from '@clerk/shared/types';

import type {
  ActorTokenStatus,
  AllowlistIdentifierType,
  BlocklistIdentifierType,
  DomainsEnrollmentModes,
  InvitationStatus,
  OrganizationDomainVerificationStatus,
  OrganizationDomainVerificationStrategy,
  OrganizationEnrollmentMode,
  OrganizationInvitationStatus,
  OrganizationMembershipRole,
  SignInStatus,
  SignUpVerificationNextAction,
  WaitlistEntryStatus,
} from './Enums';

export const ObjectType = {
  AccountlessApplication: 'accountless_application',
  ActorToken: 'actor_token',
  AllowlistIdentifier: 'allowlist_identifier',
  ApiKey: 'api_key',
  BlocklistIdentifier: 'blocklist_identifier',
  Client: 'client',
  Cookies: 'cookies',
  Domain: 'domain',
  Email: 'email',
  EmailAddress: 'email_address',
  ExternalAccount: 'external_account',
  FacebookAccount: 'facebook_account',
  GoogleAccount: 'google_account',
  Instance: 'instance',
  InstanceRestrictions: 'instance_restrictions',
  InstanceSettings: 'instance_settings',
  Invitation: 'invitation',
  Machine: 'machine',
  MachineScope: 'machine_scope',
  MachineSecretKey: 'machine_secret_key',
  M2MToken: 'machine_to_machine_token',
  JwtTemplate: 'jwt_template',
  OauthAccessToken: 'oauth_access_token',
  IdpOAuthAccessToken: 'clerk_idp_oauth_access_token',
  OAuthApplication: 'oauth_application',
  Organization: 'organization',
  OrganizationDomain: 'organization_domain',
  OrganizationInvitation: 'organization_invitation',
  OrganizationMembership: 'organization_membership',
  OrganizationSettings: 'organization_settings',
  PhoneNumber: 'phone_number',
  ProxyCheck: 'proxy_check',
  RedirectUrl: 'redirect_url',
  SamlAccount: 'saml_account',
  SamlConnection: 'saml_connection',
  Session: 'session',
  SignInAttempt: 'sign_in_attempt',
  SignInToken: 'sign_in_token',
  SignUpAttempt: 'sign_up_attempt',
  SmsMessage: 'sms_message',
  User: 'user',
  WaitlistEntry: 'waitlist_entry',
  Web3Wallet: 'web3_wallet',
  Token: 'token',
  TotalCount: 'total_count',
  TestingToken: 'testing_token',
  Role: 'role',
  Permission: 'permission',
  BillingPayer: 'commerce_payer',
  BillingPaymentAttempt: 'commerce_payment_attempt',
  BillingSubscription: 'commerce_subscription',
  BillingSubscriptionItem: 'commerce_subscription_item',
  BillingPlan: 'commerce_plan',
  Feature: 'feature',
} as const;

export type ObjectType = (typeof ObjectType)[keyof typeof ObjectType];

export interface ClerkResourceJSON {
  /**
   * The type of the resource.
   */
  object: ObjectType;
  /**
   * The unique identifier for the resource.
   */
  id: string;
}

export interface CookiesJSON {
  object: typeof ObjectType.Cookies;
  cookies: string[];
}

export interface TokenJSON {
  object: typeof ObjectType.Token;
  jwt: string;
}

export interface AccountlessApplicationJSON extends ClerkResourceJSON {
  object: typeof ObjectType.AccountlessApplication;
  publishable_key: string;
  secret_key: string;
  claim_url: string;
  api_keys_url: string;
}

export interface ActorTokenJSON extends ClerkResourceJSON {
  object: typeof ObjectType.ActorToken;
  id: string;
  status: ActorTokenStatus;
  user_id: string;
  actor: Record<string, unknown> | null;
  token?: string | null;
  url?: string | null;
  created_at: number;
  updated_at: number;
}

export interface AllowlistIdentifierJSON extends ClerkResourceJSON {
  object: typeof ObjectType.AllowlistIdentifier;
  identifier: string;
  identifier_type: AllowlistIdentifierType;
  instance_id?: string;
  invitation_id?: string;
  created_at: number;
  updated_at: number;
}

export interface BlocklistIdentifierJSON extends ClerkResourceJSON {
  object: typeof ObjectType.BlocklistIdentifier;
  identifier: string;
  identifier_type: BlocklistIdentifierType;
  instance_id?: string;
  created_at: number;
  updated_at: number;
}

export interface ClientJSON extends ClerkResourceJSON {
  object: typeof ObjectType.Client;
  session_ids: string[];
  sessions: SessionJSON[];
  sign_in_id: string | null;
  sign_up_id: string | null;
  last_active_session_id: string | null;
  last_authentication_strategy: LastAuthenticationStrategy | null;
  created_at: number;
  updated_at: number;
}

export interface CnameTargetJSON {
  host: string;
  value: string;
  /**
   * Denotes whether this CNAME target is required to be set in order for the domain to be considered deployed.
   */
  required: boolean;
}

export interface DomainJSON extends ClerkResourceJSON {
  object: typeof ObjectType.Domain;
  id: string;
  name: string;
  is_satellite: boolean;
  frontend_api_url: string;
  /**
   * null for satellite domains
   */
  accounts_portal_url?: string | null;
  proxy_url?: string;
  development_origin: string;
  cname_targets: CnameTargetJSON[];
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
  phone_number: string | null;
  public_metadata?: Record<string, unknown> | null;
  label: string | null;
  verification: VerificationJSON | null;
}

export interface JwksJSON {
  keys?: JwksKeyJSON[];
}

export interface JwksKeyJSON {
  use: string;
  kty: string;
  kid: string;
  alg: string;
  n: string;
  e: string;
}

export interface JwtTemplateJSON extends ClerkResourceJSON {
  object: typeof ObjectType.JwtTemplate;
  id: string;
  name: string;
  claims: object;
  lifetime: number;
  allowed_clock_skew: number;
  custom_signing_key: boolean;
  signing_algorithm: string;
  created_at: number;
  updated_at: number;
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
  saml_connection: SamlAccountConnectionJSON | null;
  last_authenticated_at: number | null;
  enterprise_connection_id: string | null;
}

export interface IdentificationLinkJSON extends ClerkResourceJSON {
  type: string;
}

export interface OrganizationSettingsJSON extends ClerkResourceJSON {
  object: typeof ObjectType.OrganizationSettings;
  enabled: boolean;
  max_allowed_memberships: number;
  max_allowed_roles: number;
  max_allowed_permissions: number;
  creator_role: string;
  admin_delete_enabled: boolean;
  domains_enabled: boolean;
  slug_disabled: boolean;
  domains_enrollment_modes: Array<DomainsEnrollmentModes>;
  domains_default_role: string;
}

export interface InstanceJSON extends ClerkResourceJSON {
  object: typeof ObjectType.Instance;
  id: string;
  environment_type: string;
  allowed_origins: Array<string> | null;
}

export interface InstanceRestrictionsJSON extends ClerkResourceJSON {
  object: typeof ObjectType.InstanceRestrictions;
  allowlist: boolean;
  blocklist: boolean;
  block_email_subaddresses: boolean;
  block_disposable_email_domains: boolean;
  ignore_dots_for_gmail_addresses: boolean;
}

export interface InstanceSettingsJSON extends ClerkResourceJSON {
  object: typeof ObjectType.InstanceSettings;
  id: string;
  restricted_to_allowlist: boolean;
  from_email_address: string;
  progressive_sign_up: boolean;
  enhanced_email_deliverability: boolean;
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
  expires_at?: number;
}

export interface OAuthApplicationJSON extends ClerkResourceJSON {
  object: typeof ObjectType.OAuthApplication;
  id: string;
  instance_id: string;
  name: string;
  client_id: string;
  client_uri: string | null;
  client_image_url: string | null;
  dynamically_registered: boolean;
  consent_screen_enabled: boolean;
  pkce_required: boolean;
  public: boolean;
  scopes: string;
  redirect_uris: Array<string>;
  authorize_url: string;
  token_fetch_url: string;
  user_info_url: string;
  discovery_url: string;
  token_introspection_url: string;
  created_at: number;
  updated_at: number;
  client_secret?: string;
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
  created_by?: string;
  created_at: number;
  updated_at: number;
}

export interface OrganizationDomainJSON extends ClerkResourceJSON {
  object: typeof ObjectType.OrganizationDomain;
  id: string;
  name: string;
  organization_id: string;
  enrollment_mode: OrganizationEnrollmentMode;
  verification: OrganizationDomainVerificationJSON | null;
  affiliation_email_address: string | null;
  created_at: number;
  updated_at: number;
  total_pending_invitations: number;
  total_pending_suggestions: number;
}

export interface OrganizationDomainVerificationJSON {
  status: OrganizationDomainVerificationStatus;
  strategy: OrganizationDomainVerificationStrategy;
  attempts: number;
  expires_at: number;
}

export interface OrganizationInvitationJSON extends ClerkResourceJSON {
  email_address: string;
  role: OrganizationMembershipRole;
  role_name: string;
  organization_id: string;
  public_organization_data?: PublicOrganizationDataJSON | null;
  status?: OrganizationInvitationStatus;
  public_metadata: OrganizationInvitationPublicMetadata;
  private_metadata: OrganizationInvitationPrivateMetadata;
  url: string | null;
  created_at: number;
  updated_at: number;
  expires_at: number;
}

export interface OrganizationInvitationAcceptedJSON extends OrganizationInvitationJSON {
  status: 'accepted';
  user_id: string;
}

/**
 * @interface
 */
export interface PublicOrganizationDataJSON extends ClerkResourceJSON {
  /**
   * The name of the organization.
   */
  name: string;
  /**
   * The slug of the organization.
   */
  slug: string;
  /**
   * Holds the default organization profile image. Compatible with Clerk's [Image Optimization](https://clerk.com/docs/guides/development/image-optimization).
   */
  image_url?: string;
  /**
   * Whether the organization has a profile image.
   */
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

export type ProxyCheckJSON = {
  object: typeof ObjectType.ProxyCheck;
  id: string;
  domain_id: string;
  last_run_at: number | null;
  proxy_url: string;
  successful: boolean;
  created_at: number;
  updated_at: number;
};

export interface RedirectUrlJSON extends ClerkResourceJSON {
  object: typeof ObjectType.RedirectUrl;
  url: string;
  created_at: number;
  updated_at: number;
}

export interface SessionActivityJSON extends ClerkResourceJSON {
  id: string;
  device_type?: string;
  is_mobile: boolean;
  browser_name?: string;
  browser_version?: string;
  ip_address?: string;
  city?: string;
  country?: string;
}

export interface SessionJSON extends ClerkResourceJSON {
  object: typeof ObjectType.Session;
  client_id: string;
  user_id: string;
  status: string;
  last_active_organization_id?: string;
  actor: Record<string, unknown> | null;
  latest_activity?: SessionActivityJSON;
  last_active_at: number;
  expire_at: number;
  abandon_at: number;
  created_at: number;
  updated_at: number;
}

/**
 * Session webhook event payload extending `SessionJSON` interface with associated `User` information.
 * Used for `session.created`, `session.ended`, `session.removed`, and `session.revoked` webhook events.
 */
export interface SessionWebhookEventJSON extends SessionJSON {
  /**
   * The user associated with the session, or null if not available.
   */
  user: UserJSON | null;
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
  id: string;
  status: SignUpStatus;
  required_fields: string[];
  optional_fields: string[];
  missing_fields: string[];
  unverified_fields: string[];
  verifications: SignUpVerificationsJSON;
  username: string | null;
  email_address: string | null;
  phone_number: string | null;
  web3_wallet: string | null;
  password_enabled: boolean;
  first_name: string | null;
  last_name: string | null;
  public_metadata?: Record<string, unknown> | null;
  unsafe_metadata?: Record<string, unknown> | null;
  custom_action: boolean;
  external_id: string | null;
  created_session_id: string | null;
  created_user_id: string | null;
  abandon_at: number | null;
  legal_accepted_at: number | null;

  /**
   * @deprecated Please use `verifications.external_account` instead
   */
  external_account: object | null;
}

export interface SignUpVerificationsJSON {
  email_address: SignUpVerificationJSON;
  phone_number: SignUpVerificationJSON;
  web3_wallet: SignUpVerificationJSON;
  external_account: VerificationJSON;
}

export interface SignUpVerificationJSON {
  next_action: SignUpVerificationNextAction;
  supported_strategies: string[];
}

export interface SMSMessageJSON extends ClerkResourceJSON {
  object: typeof ObjectType.SmsMessage;
  from_phone_number: string;
  to_phone_number: string;
  phone_number_id: string | null;
  user_id?: string;
  message: string;
  status: string;
  slug?: string | null;
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
  delete_self_enabled: boolean;
  legal_accepted_at: number | null;
  /**
   * The locale of the user in BCP-47 format.
   */
  locale: string | null;
}

export interface VerificationJSON extends ClerkResourceJSON {
  status: VerificationStatus;
  strategy: string;
  attempts: number | null;
  expire_at: number | null;
  verified_at_client?: string;
  external_verification_redirect_url?: string | null;
  nonce?: string | null;
  message?: string | null;
}

export interface WaitlistEntryJSON extends ClerkResourceJSON {
  object: typeof ObjectType.WaitlistEntry;
  id: string;
  status: WaitlistEntryStatus;
  email_address: string;
  invitation: InvitationJSON | null;
  is_locked: boolean;
  created_at: number;
  updated_at: number;
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

/**
 * User deletion webhook event payload that extends `DeletedObjectJSON`.
 * Includes the `external_id` field to identify the deleted user in external systems.
 * Used for `user.deleted` webhook events.
 */
export interface UserDeletedJSON extends DeletedObjectJSON {
  /**
   * The external identifier associated with the deleted user, if one was set.
   */
  external_id?: string;
}

export interface PaginatedResponseJSON {
  data: object[];
  total_count?: number;
}

export interface SamlConnectionJSON extends ClerkResourceJSON {
  object: typeof ObjectType.SamlConnection;
  name: string;
  domain: string;
  organization_id: string | null;
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

export interface RoleJSON extends ClerkResourceJSON {
  object: typeof ObjectType.Role;
  key: string;
  name: string;
  description: string;
  permissions: PermissionJSON[];
  is_creator_eligible: boolean;
  created_at: number;
  updated_at: number;
}

export interface PermissionJSON extends ClerkResourceJSON {
  object: typeof ObjectType.Permission;
  key: string;
  name: string;
  description: string;
  created_at: number;
  updated_at: number;
}

export interface SamlAccountConnectionJSON extends ClerkResourceJSON {
  id: string;
  name: string;
  domain: string;
  active: boolean;
  provider: string;
  sync_user_attributes: boolean;
  allow_subdomains: boolean;
  allow_idp_initiated: boolean;
  disable_additional_identifications: boolean;
  created_at: number;
  updated_at: number;
}

export interface MachineJSON extends ClerkResourceJSON {
  object: typeof ObjectType.Machine;
  id: string;
  name: string;
  instance_id: string;
  created_at: number;
  updated_at: number;
  default_token_ttl: number;
  scoped_machines: MachineJSON[];
  secret_key?: string;
}

export interface MachineScopeJSON {
  object: typeof ObjectType.MachineScope;
  from_machine_id: string;
  to_machine_id: string;
  created_at?: number;
  deleted?: boolean;
}

export interface MachineSecretKeyJSON {
  object: typeof ObjectType.MachineSecretKey;
  secret: string;
}

export interface M2MTokenJSON extends ClerkResourceJSON {
  object: typeof ObjectType.M2MToken;
  token?: string;
  subject: string;
  scopes: string[];
  claims: Record<string, any> | null;
  revoked: boolean;
  revocation_reason: string | null;
  expired: boolean;
  expiration: number | null;
  created_at: number;
  updated_at: number;
}

export interface APIKeyJSON extends ClerkResourceJSON {
  object: typeof ObjectType.ApiKey;
  type: string;
  name: string;
  secret?: string;
  subject: string;
  scopes: string[];
  claims: Record<string, any> | null;
  revoked: boolean;
  revocation_reason: string | null;
  expired: boolean;
  expiration: number | null;
  created_by: string | null;
  description: string | null;
  last_used_at: number | null;
  created_at: number;
  updated_at: number;
}

export interface IdPOAuthAccessTokenJSON extends ClerkResourceJSON {
  object: typeof ObjectType.IdpOAuthAccessToken;
  client_id: string;
  type: string;
  subject: string;
  scopes: string[];
  revoked: boolean;
  revocation_reason: string | null;
  expired: boolean;
  expiration: number | null;
  created_at: number;
  updated_at: number;
}

export interface BillingPayerJSON extends ClerkResourceJSON {
  object: typeof ObjectType.BillingPayer;
  instance_id: string;
  user_id?: string;
  first_name?: string;
  last_name?: string;
  email: string;
  organization_id?: string;
  organization_name?: string;
  image_url: string;
  created_at: number;
  updated_at: number;
}

interface BillingPayeeJSON {
  id: string;
  gateway_type: string;
  gateway_external_id: string;
  gateway_status: 'active' | 'pending' | 'restricted' | 'disconnected';
}

interface BillingMoneyAmountJSON {
  amount: number;
  amount_formatted: string;
  currency: string;
  currency_symbol: string;
}

interface BillingTotalsJSON {
  subtotal: BillingMoneyAmountJSON;
  tax_total: BillingMoneyAmountJSON;
  grand_total: BillingMoneyAmountJSON;
}

export interface FeatureJSON extends ClerkResourceJSON {
  object: typeof ObjectType.Feature;
  name: string;
  description?: string | null;
  slug: string;
  avatar_url?: string | null;
}

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export interface BillingPlanJSON extends ClerkResourceJSON {
  object: typeof ObjectType.BillingPlan;
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_default: boolean;
  is_recurring: boolean;
  has_base_fee: boolean;
  publicly_visible: boolean;
  fee: BillingMoneyAmountJSON;
  annual_fee: BillingMoneyAmountJSON | null;
  annual_monthly_fee: BillingMoneyAmountJSON | null;
  for_payer_type: 'org' | 'user';
  features?: FeatureJSON[];
}

type BillingSubscriptionItemStatus =
  | 'abandoned'
  | 'active'
  | 'canceled'
  | 'ended'
  | 'expired'
  | 'incomplete'
  | 'past_due'
  | 'upcoming';

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change. It is advised to [pin](https://clerk.com/docs/pinning) the SDK version and the clerk-js version to avoid breaking changes.
 */
export interface BillingSubscriptionItemJSON extends ClerkResourceJSON {
  object: typeof ObjectType.BillingSubscriptionItem;
  status: BillingSubscriptionItemStatus;
  plan_period: 'month' | 'annual';
  payer_id?: string;
  period_start: number;
  period_end: number | null;
  is_free_trial?: boolean;
  ended_at: number | null;
  created_at: number;
  updated_at: number;
  canceled_at: number | null;
  past_due_at: number | null;
  lifetime_paid: BillingMoneyAmountJSON | null;
  next_payment?: {
    amount: number;
    date: number;
  } | null;
  amount: BillingMoneyAmountJSON;
  plan?: BillingPlanJSON | null;
  plan_id?: string | null;
}

/**
 * Webhooks specific interface for BillingSubscriptionItem.
 */
export interface BillingSubscriptionItemWebhookEventJSON extends ClerkResourceJSON {
  object: typeof ObjectType.BillingSubscriptionItem;
  status: BillingSubscriptionItemStatus;
  credit: {
    amount: BillingMoneyAmountJSON;
    cycle_days_remaining: number;
    cycle_days_total: number;
    cycle_remaining_percent: number;
  };
  proration_date: string;
  plan_period: 'month' | 'annual';
  period_start: number;
  period_end?: number;
  canceled_at?: number;
  past_due_at?: number;
  lifetime_paid: number;
  next_payment_amount: number;
  next_payment_date: number;
  amount: BillingMoneyAmountJSON;
  plan?: {
    id: string;
    instance_id: string;
    product_id: string;
    name: string;
    slug: string;
    description?: string;
    is_default: boolean;
    is_recurring: boolean;
    amount: number;
    period: 'month' | 'annual';
    interval: number;
    has_base_fee: boolean;
    currency: string;
    annual_monthly_amount: number;
    publicly_visible: boolean;
  } | null;
  plan_id?: string | null;
  payer?: BillingPayerJSON;
}

/**
 * Webhooks specific interface for BillingPaymentAttempt.
 */
export interface BillingPaymentAttemptWebhookEventJSON extends ClerkResourceJSON {
  object: typeof ObjectType.BillingPaymentAttempt;
  instance_id: string;
  payment_id: string;
  statement_id: string;
  gateway_external_id: string;
  status: 'pending' | 'paid' | 'failed';
  created_at: number;
  updated_at: number;
  paid_at?: number;
  failed_at?: number;
  failed_reason?: {
    code: string;
    decline_code: string;
  };
  billing_date: number;
  charge_type: 'checkout' | 'recurring';
  payee: BillingPayeeJSON;
  payer: BillingPayerJSON;
  totals: BillingTotalsJSON;
  payment_source: {
    id: string;
    gateway: string;
    gateway_external_id: string;
    gateway_external_account_id?: string;
    payment_method: string;
    status: 'active' | 'disconnected';
    card_type?: string;
    last4?: string;
  };
  subscription_items: BillingSubscriptionItemWebhookEventJSON[];
}

/**
 * Webhooks specific interface for BillingSubscription.
 */
export interface BillingSubscriptionWebhookEventJSON extends ClerkResourceJSON {
  object: typeof ObjectType.BillingSubscription;
  status: 'abandoned' | 'active' | 'canceled' | 'ended' | 'expired' | 'incomplete' | 'past_due' | 'upcoming';
  active_at?: number;
  canceled_at?: number;
  created_at: number;
  ended_at?: number;
  past_due_at?: number;
  updated_at: number;
  latest_payment_id: string;
  payer_id: string;
  payer: BillingPayerJSON;
  payment_source_id: string;
  items: BillingSubscriptionItemWebhookEventJSON[];
}

export interface BillingSubscriptionJSON extends ClerkResourceJSON {
  object: typeof ObjectType.BillingSubscription;
  status: 'active' | 'past_due' | 'canceled' | 'ended' | 'abandoned' | 'incomplete';
  payer_id: string;
  created_at: number;
  updated_at: number;
  active_at: number | null;
  past_due_at: number | null;
  subscription_items: BillingSubscriptionItemJSON[];
  next_payment?: {
    date: number;
    amount: BillingMoneyAmountJSON;
  };
  eligible_for_free_trial?: boolean;
}

export interface WebhooksSvixJSON {
  svix_url: string;
}
