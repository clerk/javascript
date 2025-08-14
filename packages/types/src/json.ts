/**
 * Currently representing API DTOs in their JSON form.
 */

import type { APIKeysSettingsJSON } from './apiKeysSettings';
import type {
  CommercePayerResourceType,
  CommercePaymentChargeType,
  CommercePaymentSourceStatus,
  CommercePaymentStatus,
  CommerceStatementStatus,
  CommerceSubscriptionPlanPeriod,
  CommerceSubscriptionStatus,
} from './commerce';
import type { CommerceSettingsJSON } from './commerceSettings';
import type { DisplayConfigJSON } from './displayConfig';
import type { EnterpriseProtocol, EnterpriseProvider } from './enterpriseAccount';
import type { ActClaim } from './jwtv2';
import type { OAuthProvider } from './oauth';
import type { OrganizationDomainVerificationStatus, OrganizationEnrollmentMode } from './organizationDomain';
import type { OrganizationInvitationStatus } from './organizationInvitation';
import type { OrganizationCustomRoleKey, OrganizationPermissionKey } from './organizationMembership';
import type { OrganizationSettingsJSON } from './organizationSettings';
import type { OrganizationSuggestionStatus } from './organizationSuggestion';
import type { PhoneCodeChannel } from './phoneCodeChannel';
import type { SamlIdpSlug } from './saml';
import type { SessionStatus, SessionTask } from './session';
import type { SessionVerificationLevel, SessionVerificationStatus } from './sessionVerification';
import type { SignInFirstFactor, SignInJSON, SignInSecondFactor } from './signIn';
import type { SignUpField, SignUpIdentificationField, SignUpStatus } from './signUp';
import type { BoxShadow, Color, EmUnit, FontWeight, HexColor } from './theme';
import type { UserSettingsJSON } from './userSettings';
import type { CamelToSnake } from './utils';
import type { VerificationStatus } from './verification';

export interface ClerkResourceJSON {
  // TODO: Shall we make this optional?
  id: string;
  object: string;
}

export type PartialWithClerkResource<T extends ClerkResourceJSON> = Omit<Partial<ClerkResourceJSON>, 'id' | 'object'> &
  Pick<T, 'id' | 'object'>;

export interface DisplayThemeJSON {
  general: {
    color: HexColor;
    background_color: Color;
    font_family: string;
    font_color: HexColor;
    label_font_weight: FontWeight;
    padding: EmUnit;
    border_radius: EmUnit;
    box_shadow: BoxShadow;
  };
  buttons: {
    font_color: HexColor;
    font_family: string;
    font_weight: FontWeight;
  };
  accounts: {
    background_color: Color;
  };
}

export interface ImageJSON {
  object: 'image';
  id: string;
  name: string;
  public_url: string;
}

export interface EnvironmentJSON extends ClerkResourceJSON {
  api_keys_settings: APIKeysSettingsJSON;
  auth_config: AuthConfigJSON;
  client_debug_mode?: boolean;
  commerce_settings: CommerceSettingsJSON;
  display_config: DisplayConfigJSON;
  maintenance_mode: boolean;
  organization_settings: OrganizationSettingsJSON;
  user_settings: UserSettingsJSON;
}

export interface ClientJSON extends ClerkResourceJSON {
  object: 'client';
  id: string;
  sessions: SessionJSON[];
  sign_up: SignUpJSON | null;
  sign_in: SignInJSON | null;
  captcha_bypass?: boolean; // this is used by the @clerk/testing package
  last_active_session_id: string | null;
  cookie_expires_at: number | null;
  created_at: number;
  updated_at: number;
}

export interface SignUpJSON extends ClerkResourceJSON {
  object: 'sign_up';
  status: SignUpStatus;
  required_fields: SignUpField[];
  optional_fields: SignUpField[];
  missing_fields: SignUpField[];
  unverified_fields: SignUpIdentificationField[];
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  email_address: string | null;
  phone_number: string | null;
  web3_wallet: string | null;
  external_account_strategy: string | null;
  external_account: any;
  has_password: boolean;
  unsafe_metadata: SignUpUnsafeMetadata;
  created_session_id: string | null;
  created_user_id: string | null;
  abandon_at: number | null;
  legal_accepted_at: number | null;
  verifications: SignUpVerificationsJSON | null;
}

export interface SessionJSON extends ClerkResourceJSON {
  object: 'session';
  id: string;
  status: SessionStatus;
  /**
   * The tuple represents the minutes that have passed since the last time a first or second factor were verified.
   * This API is experimental and may change at any moment.
   * @experimental
   */
  factor_verification_age: [firstFactorAge: number, secondFactorAge: number] | null;
  expire_at: number;
  abandon_at: number;
  last_active_at: number;
  last_active_token: TokenJSON;
  last_active_organization_id: string | null;
  actor: ActClaim | null;
  tasks: Array<SessionTask> | null;
  user: UserJSON;
  public_user_data: PublicUserDataJSON;
  created_at: number;
  updated_at: number;
}

export interface SessionVerificationJSON extends ClerkResourceJSON {
  object: 'session_verification';
  status: SessionVerificationStatus;
  first_factor_verification: VerificationJSON | null;
  session: SessionJSON;
  second_factor_verification: VerificationJSON | null;
  level: SessionVerificationLevel;
  supported_first_factors: SignInFirstFactorJSON[] | null;
  supported_second_factors: SignInSecondFactorJSON[] | null;
}

export interface EmailAddressJSON extends ClerkResourceJSON {
  object: 'email_address';
  email_address: string;
  verification: VerificationJSON | null;
  linked_to: IdentificationLinkJSON[];
  matches_sso_connection: boolean;
}

export interface IdentificationLinkJSON extends ClerkResourceJSON {
  id: string;
  type: string;
}

export interface PhoneNumberJSON extends ClerkResourceJSON {
  object: 'phone_number';
  id: string;
  phone_number: string;
  reserved_for_second_factor: boolean;
  default_second_factor: boolean;
  linked_to: IdentificationLinkJSON[];
  verification: VerificationJSON | null;
  backup_codes?: string[];
}

export interface PasskeyJSON extends ClerkResourceJSON {
  object: 'passkey';
  id: string;
  name: string | null;
  verification: VerificationJSON | null;
  last_used_at: number | null;
  updated_at: number;
  created_at: number;
}

export interface Web3WalletJSON extends ClerkResourceJSON {
  object: 'web3_wallet';
  id: string;
  web3_wallet: string;
  verification: VerificationJSON | null;
}

export interface ExternalAccountJSON extends ClerkResourceJSON {
  object: 'external_account';
  provider: OAuthProvider;
  identification_id: string;
  provider_user_id: string;
  approved_scopes: string;
  email_address: string;
  first_name: string;
  last_name: string;
  image_url: string;
  username: string;
  phone_number: string;
  public_metadata: Record<string, unknown>;
  label: string;
  verification?: VerificationJSON;
}

export interface EnterpriseAccountJSON extends ClerkResourceJSON {
  object: 'enterprise_account';
  active: boolean;
  email_address: string;
  enterprise_connection: EnterpriseAccountConnectionJSON | null;
  first_name: string | null;
  last_name: string | null;
  protocol: EnterpriseProtocol;
  provider: EnterpriseProvider;
  provider_user_id: string | null;
  public_metadata: Record<string, unknown>;
  verification: VerificationJSON | null;
}

export interface EnterpriseAccountConnectionJSON extends ClerkResourceJSON {
  active: boolean;
  allow_idp_initiated: boolean;
  allow_subdomains: boolean;
  disable_additional_identifications: boolean;
  domain: string;
  logo_public_url: string | null;
  name: string;
  protocol: EnterpriseProtocol;
  provider: EnterpriseProvider;
  sync_user_attributes: boolean;
  created_at: number;
  updated_at: number;
}

export interface SamlAccountJSON extends ClerkResourceJSON {
  object: 'saml_account';
  provider: SamlIdpSlug;
  provider_user_id: string | null;
  active: boolean;
  email_address: string;
  first_name: string;
  last_name: string;
  verification?: VerificationJSON;
  saml_connection?: SamlAccountConnectionJSON;
}

export interface UserJSON extends ClerkResourceJSON {
  object: 'user';
  id: string;
  external_id: string | null;
  primary_email_address_id: string | null;
  primary_phone_number_id: string | null;
  primary_web3_wallet_id: string | null;
  image_url: string;
  has_image: boolean;
  username: string | null;
  email_addresses: EmailAddressJSON[];
  phone_numbers: PhoneNumberJSON[];
  web3_wallets: Web3WalletJSON[];
  external_accounts: ExternalAccountJSON[];
  enterprise_accounts: EnterpriseAccountJSON[];
  passkeys: PasskeyJSON[];
  /**
   * @deprecated Use `enterprise_accounts` instead.
   */
  saml_accounts: SamlAccountJSON[];

  organization_memberships: OrganizationMembershipJSON[];
  password_enabled: boolean;
  profile_image_id: string;
  first_name: string | null;
  last_name: string | null;
  totp_enabled: boolean;
  backup_code_enabled: boolean;
  two_factor_enabled: boolean;
  public_metadata: UserPublicMetadata;
  unsafe_metadata: UserUnsafeMetadata;
  last_sign_in_at: number | null;
  create_organization_enabled: boolean;
  create_organizations_limit: number | null;
  delete_self_enabled: boolean;
  legal_accepted_at: number | null;
  updated_at: number;
  created_at: number;
}

export interface PublicUserDataJSON {
  first_name: string | null;
  last_name: string | null;
  image_url: string;
  has_image: boolean;
  identifier: string;
  user_id?: string;
}

export interface SessionWithActivitiesJSON extends Omit<SessionJSON, 'user'> {
  user: null;
  latest_activity: SessionActivityJSON;
}

export interface AuthConfigJSON extends ClerkResourceJSON {
  single_session_mode: boolean;
  claimed_at: number | null;
  reverification: boolean;
  preferred_channels?: Record<string, PhoneCodeChannel>;
}

export interface VerificationJSON extends ClerkResourceJSON {
  status: VerificationStatus;
  verified_at_client: string;
  strategy: string;
  nonce?: string;
  message?: string;
  external_verification_redirect_url?: string;
  attempts: number;
  expire_at: number;
  channel?: PhoneCodeChannel;
  error: ClerkAPIErrorJSON;
}

export interface SignUpVerificationsJSON {
  email_address: SignUpVerificationJSON;
  phone_number: SignUpVerificationJSON;
  web3_wallet: SignUpVerificationJSON;
  external_account: VerificationJSON;
}

export interface SignUpVerificationJSON extends VerificationJSON {
  next_action: string;
  supported_strategies: string[];
  channel?: PhoneCodeChannel;
}

export interface ClerkAPIErrorJSON {
  code: string;
  message: string;
  long_message?: string;
  meta?: {
    param_name?: string;
    session_id?: string;
    email_addresses?: string[];
    identifiers?: string[];
    zxcvbn?: {
      suggestions: {
        code: string;
        message: string;
      }[];
    };
    plan?: {
      amount_formatted: string;
      annual_monthly_amount_formatted: string;
      currency_symbol: string;
      id: string;
      name: string;
    };
    is_plan_upgrade_possible?: boolean;
  };
}

export interface TokenJSON extends ClerkResourceJSON {
  object: 'token';
  jwt: string;
}

export interface SessionActivityJSON extends ClerkResourceJSON {
  object: 'session_activity';
  browser_name?: string;
  browser_version?: string;
  device_type?: string;
  ip_address?: string;
  city?: string;
  country?: string;
  is_mobile?: boolean;
}

export interface OrganizationJSON extends ClerkResourceJSON {
  object: 'organization';
  id: string;
  image_url: string;
  has_image: boolean;
  name: string;
  slug: string;
  public_metadata: OrganizationPublicMetadata;
  created_at: number;
  updated_at: number;
  members_count: number;
  pending_invitations_count: number;
  admin_delete_enabled: boolean;
  max_allowed_memberships: number;
}

export interface OrganizationMembershipJSON extends ClerkResourceJSON {
  object: 'organization_membership';
  id: string;
  organization: OrganizationJSON;
  permissions: OrganizationPermissionKey[];
  public_metadata: OrganizationMembershipPublicMetadata;
  public_user_data?: PublicUserDataJSON;
  role: OrganizationCustomRoleKey;
  role_name: string;
  created_at: number;
  updated_at: number;
}

export interface OrganizationInvitationJSON extends ClerkResourceJSON {
  object: 'organization_invitation';
  id: string;
  email_address: string;
  organization_id: string;
  public_metadata: OrganizationInvitationPublicMetadata;
  status: OrganizationInvitationStatus;
  role: OrganizationCustomRoleKey;
  role_name: string;
  created_at: number;
  updated_at: number;
}

export interface OrganizationDomainVerificationJSON {
  status: OrganizationDomainVerificationStatus;
  strategy: 'email_code'; // only available value for now
  attempts: number;
  expires_at: number;
}

export interface OrganizationDomainJSON extends ClerkResourceJSON {
  object: 'organization_domain';
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

export interface RoleJSON extends ClerkResourceJSON {
  object: 'role';
  id: string;
  key: string;
  name: string;
  description: string;
  permissions: PermissionJSON[];
  created_at: number;
  updated_at: number;
}

export interface PermissionJSON extends ClerkResourceJSON {
  object: 'permission';
  id: string;
  key: string;
  name: string;
  description: string;
  type: 'system' | 'user';
  created_at: number;
  updated_at: number;
}

export interface PublicOrganizationDataJSON {
  id: string;
  name: string;
  slug: string | null;
  has_image: boolean;
  image_url: string;
}

export interface OrganizationSuggestionJSON extends ClerkResourceJSON {
  object: 'organization_suggestion';
  id: string;
  public_organization_data: PublicOrganizationDataJSON;
  status: OrganizationSuggestionStatus;
  created_at: number;
  updated_at: number;
}

export interface OrganizationMembershipRequestJSON extends ClerkResourceJSON {
  object: 'organization_membership_request';
  id: string;
  organization_id: string;
  status: OrganizationInvitationStatus;
  public_user_data: PublicUserDataJSON;
  created_at: number;
  updated_at: number;
}

export interface UserOrganizationInvitationJSON extends ClerkResourceJSON {
  object: 'organization_invitation';
  id: string;
  email_address: string;
  public_organization_data: PublicOrganizationDataJSON;
  public_metadata: OrganizationInvitationPublicMetadata;
  status: OrganizationInvitationStatus;
  role: OrganizationCustomRoleKey;
  created_at: number;
  updated_at: number;
}

export interface UserDataJSON {
  first_name?: string;
  last_name?: string;
  image_url: string;
  has_image: boolean;
}

export interface TOTPJSON extends ClerkResourceJSON {
  object: 'totp';
  id: string;
  secret?: string;
  uri?: string;
  verified: boolean;
  backup_codes?: string[];
  created_at: number;
  updated_at: number;
}

export interface BackupCodeJSON extends ClerkResourceJSON {
  object: 'backup_code';
  id: string;
  codes: string[];
  created_at: number;
  updated_at: number;
}

export interface DeletedObjectJSON {
  object: string;
  id?: string;
  slug?: string;
  deleted: boolean;
}

export type SignInFirstFactorJSON = CamelToSnake<SignInFirstFactor>;
export type SignInSecondFactorJSON = CamelToSnake<SignInSecondFactor>;

/**
 * Types for WebAuthN passkeys
 */

type Base64UrlString = string;

interface PublicKeyCredentialUserEntityJSON {
  name: string;
  displayName: string;
  id: Base64UrlString;
}

interface PublicKeyCredentialDescriptorJSON {
  type: 'public-key';
  id: Base64UrlString;
  transports?: ('ble' | 'hybrid' | 'internal' | 'nfc' | 'usb')[];
}

interface AuthenticatorSelectionCriteriaJSON {
  requireResidentKey: boolean;
  residentKey: 'discouraged' | 'preferred' | 'required';
  userVerification: 'discouraged' | 'preferred' | 'required';
}

export interface PublicKeyCredentialCreationOptionsJSON {
  rp: PublicKeyCredentialRpEntity;
  user: PublicKeyCredentialUserEntityJSON;
  challenge: Base64UrlString;
  pubKeyCredParams: PublicKeyCredentialParameters[];
  timeout: number;
  excludeCredentials: PublicKeyCredentialDescriptorJSON[];
  authenticatorSelection: AuthenticatorSelectionCriteriaJSON;
  attestation: 'direct' | 'enterprise' | 'indirect' | 'none';
}

export interface PublicKeyCredentialRequestOptionsJSON {
  allowCredentials: PublicKeyCredentialDescriptorJSON[];
  challenge: Base64UrlString;
  rpId: string;
  timeout: number;
  userVerification: 'discouraged' | 'preferred' | 'required';
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

export interface WaitlistJSON extends ClerkResourceJSON {
  object: 'waitlist';
  id: string;
  created_at: number;
  updated_at: number;
}

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
 * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
 * @example
 * ```tsx
 * <ClerkProvider clerkJsVersion="x.x.x" />
 * ```
 */
export interface CommerceFeatureJSON extends ClerkResourceJSON {
  object: 'commerce_feature';
  id: string;
  name: string;
  description: string;
  slug: string;
  avatar_url: string;
}

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
 * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
 * @example
 * ```tsx
 * <ClerkProvider clerkJsVersion="x.x.x" />
 * ```
 */
export interface CommercePlanJSON extends ClerkResourceJSON {
  object: 'commerce_plan';
  id: string;
  name: string;
  fee: CommerceMoneyAmountJSON;
  annual_fee: CommerceMoneyAmountJSON;
  annual_monthly_fee: CommerceMoneyAmountJSON;
  amount: number;
  amount_formatted: string;
  annual_amount: number;
  annual_amount_formatted: string;
  annual_monthly_amount: number;
  annual_monthly_amount_formatted: string;
  currency_symbol: string;
  currency: string;
  description: string;
  is_default: boolean;
  is_recurring: boolean;
  has_base_fee: boolean;
  for_payer_type: CommercePayerResourceType;
  publicly_visible: boolean;
  slug: string;
  avatar_url: string;
  features: CommerceFeatureJSON[];
  free_trial_days?: number | null;
  free_trial_enabled?: boolean;
}

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
 * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
 * @example
 * ```tsx
 * <ClerkProvider clerkJsVersion="x.x.x" />
 * ```
 */
export interface CommerceProductJSON extends ClerkResourceJSON {
  object: 'commerce_product';
  id: string;
  slug: string;
  currency: string;
  is_default: boolean;
  plans: CommercePlanJSON[];
}

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
 * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
 * @example
 * ```tsx
 * <ClerkProvider clerkJsVersion="x.x.x" />
 * ```
 */
export interface CommercePaymentSourceJSON extends ClerkResourceJSON {
  object: 'commerce_payment_source';
  id: string;
  last4: string;
  payment_method: string;
  card_type: string;
  is_default: boolean;
  is_removable: boolean;
  status: CommercePaymentSourceStatus;
  wallet_type: string | null;
}

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
 * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
 * @example
 * ```tsx
 * <ClerkProvider clerkJsVersion="x.x.x" />
 * ```
 */
export interface CommerceInitializedPaymentSourceJSON extends ClerkResourceJSON {
  object: 'commerce_payment_source_initialize';
  external_client_secret: string;
  external_gateway_id: string;
  payment_method_order: string[];
}

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
 * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
 * @example
 * ```tsx
 * <ClerkProvider clerkJsVersion="x.x.x" />
 * ```
 */
export interface CommerceStatementJSON extends ClerkResourceJSON {
  object: 'commerce_statement';
  id: string;
  status: CommerceStatementStatus;
  timestamp: number;
  groups: CommerceStatementGroupJSON[];
  totals: CommerceStatementTotalsJSON;
}

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
 * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
 * @example
 * ```tsx
 * <ClerkProvider clerkJsVersion="x.x.x" />
 * ```
 */
export interface CommerceStatementGroupJSON extends ClerkResourceJSON {
  object: 'commerce_statement_group';
  timestamp: number;
  items: CommercePaymentJSON[];
}

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
 * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
 * @example
 * ```tsx
 * <ClerkProvider clerkJsVersion="x.x.x" />
 * ```
 */
export interface CommercePaymentJSON extends ClerkResourceJSON {
  object: 'commerce_payment';
  id: string;
  amount: CommerceMoneyAmountJSON;
  paid_at?: number;
  failed_at?: number;
  updated_at: number;
  payment_source: CommercePaymentSourceJSON;
  subscription: CommerceSubscriptionItemJSON;
  subscription_item: CommerceSubscriptionItemJSON;
  charge_type: CommercePaymentChargeType;
  status: CommercePaymentStatus;
}

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
 * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
 * @example
 * ```tsx
 * <ClerkProvider clerkJsVersion="x.x.x" />
 * ```
 */
export interface CommerceSubscriptionItemJSON extends ClerkResourceJSON {
  object: 'commerce_subscription_item';
  id: string;
  amount?: CommerceMoneyAmountJSON;
  credit?: {
    amount: CommerceMoneyAmountJSON;
  };
  payment_source_id: string;
  plan: CommercePlanJSON;
  plan_period: CommerceSubscriptionPlanPeriod;
  status: CommerceSubscriptionStatus;
  created_at: number;
  period_start: number;
  /**
   * Period end is `null` for subscription items that are on the free plan.
   */
  period_end: number | null;
  canceled_at: number | null;
  past_due_at: number | null;
  // TODO(@COMMERCE): Remove optional after GA.
  is_free_trial?: boolean;
}

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
 * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
 * @example
 * ```tsx
 * <ClerkProvider clerkJsVersion="x.x.x" />
 * ```
 */
export interface CommerceSubscriptionJSON extends ClerkResourceJSON {
  object: 'commerce_subscription';
  id: string;
  /**
   * Describes the details for the next payment cycle. It is `undefined` for subscription items that are cancelled or on the free plan.
   */
  next_payment?: {
    amount: CommerceMoneyAmountJSON;
    date: number;
  };
  /**
   * Due to the free plan subscription item, the top level subscription can either be `active` or `past_due`.
   */
  status: Extract<CommerceSubscriptionStatus, 'active' | 'past_due'>;
  created_at: number;
  active_at: number;
  updated_at: number | null;
  past_due_at: number | null;
  subscription_items: CommerceSubscriptionItemJSON[] | null;
  eligible_for_free_trial?: boolean;
}

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
 * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
 * @example
 * ```tsx
 * <ClerkProvider clerkJsVersion="x.x.x" />
 * ```
 */
export interface CommerceMoneyAmountJSON {
  amount: number;
  amount_formatted: string;
  currency: string;
  currency_symbol: string;
}

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
 * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
 * @example
 * ```tsx
 * <ClerkProvider clerkJsVersion="x.x.x" />
 * ```
 */
export interface CommerceCheckoutTotalsJSON {
  grand_total: CommerceMoneyAmountJSON;
  subtotal: CommerceMoneyAmountJSON;
  tax_total: CommerceMoneyAmountJSON;
  total_due_now: CommerceMoneyAmountJSON;
  credit: CommerceMoneyAmountJSON;
}

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
 * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
 * @example
 * ```tsx
 * <ClerkProvider clerkJsVersion="x.x.x" />
 * ```
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CommerceStatementTotalsJSON extends Omit<CommerceCheckoutTotalsJSON, 'total_due_now'> {}

/**
 * @experimental This is an experimental API for the Billing feature that is available under a public beta, and the API is subject to change.
 * It is advised to pin the SDK version and the clerk-js version to a specific version to avoid breaking changes.
 * @example
 * ```tsx
 * <ClerkProvider clerkJsVersion="x.x.x" />
 * ```
 */
export interface CommerceCheckoutJSON extends ClerkResourceJSON {
  object: 'commerce_checkout';
  id: string;
  external_client_secret: string;
  external_gateway_id: string;
  payment_source?: CommercePaymentSourceJSON;
  plan: CommercePlanJSON;
  plan_period: CommerceSubscriptionPlanPeriod;
  plan_period_start?: number;
  status: 'needs_confirmation' | 'completed';
  totals: CommerceCheckoutTotalsJSON;
  is_immediate_plan_change: boolean;
  // TODO(@COMMERCE): Remove optional after GA.
  free_trial_ends_at?: number | null;
}

export interface ApiKeyJSON extends ClerkResourceJSON {
  id: string;
  type: string;
  name: string;
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
