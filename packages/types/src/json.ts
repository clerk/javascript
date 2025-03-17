/**
 * Currently representing API DTOs in their JSON form.
 */

import type { __experimental_CommerceSettingsJSON } from './commerceSettings';
import type { DisplayConfigJSON } from './displayConfig';
import type { EnterpriseProtocol, EnterpriseProvider } from './enterpriseAccount';
import type { ActClaim } from './jwtv2';
import type { OAuthProvider } from './oauth';
import type { OrganizationDomainVerificationStatus, OrganizationEnrollmentMode } from './organizationDomain';
import type { OrganizationInvitationStatus } from './organizationInvitation';
import type { OrganizationCustomRoleKey, OrganizationPermissionKey } from './organizationMembership';
import type { OrganizationSettingsJSON } from './organizationSettings';
import type { OrganizationSuggestionStatus } from './organizationSuggestion';
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
  auth_config: AuthConfigJSON;
  commerce_settings: __experimental_CommerceSettingsJSON;
  display_config: DisplayConfigJSON;
  user_settings: UserSettingsJSON;
  organization_settings: OrganizationSettingsJSON;
  maintenance_mode: boolean;
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
   * @deprecated use `enterprise_accounts` instead
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
  public_user_data: PublicUserDataJSON;
  role: OrganizationCustomRoleKey;
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

export interface __experimental_CommerceFeatureJSON extends ClerkResourceJSON {
  object: 'commerce_feature';
  id: string;
  name: string;
  description: string;
  slug: string;
  avatar_url: string;
}

export interface __experimental_CommercePlanJSON extends ClerkResourceJSON {
  object: 'commerce_plan';
  id: string;
  name: string;
  amount: number;
  amount_formatted: string;
  annual_monthly_amount: number;
  annual_monthly_amount_formatted: string;
  currency_symbol: string;
  currency: string;
  description: string;
  is_active_for_payer: boolean;
  is_recurring: boolean;
  has_base_fee: boolean;
  payer_type: string[];
  publicly_visible: boolean;
  slug: string;
  avatar_url: string;
  features: __experimental_CommerceFeatureJSON[];
}

export interface __experimental_CommerceProductJSON extends ClerkResourceJSON {
  object: 'commerce_product';
  id: string;
  slug: string;
  currency: string;
  is_default: boolean;
  plans: __experimental_CommercePlanJSON[];
}

export interface __experimental_CommercePaymentSourceJSON extends ClerkResourceJSON {
  object: 'commerce_payment_source';
  id: string;
  last4: string;
  payment_method: string;
  card_type: string;
}

export interface __experimental_CommerceInvoiceJSON extends ClerkResourceJSON {
  object: 'commerce_invoice';
  id: string;
  paid_on: number;
  payment_due_on: number;
  payment_source_id: string;
  plan_id: string;
  status: string;
  totals: __experimental_CommerceTotalsJSON;
}

export interface __experimental_CommerceSubscriptionJSON extends ClerkResourceJSON {
  object: 'commerce_subscription';
  id: string;
  payment_source_id: string;
  plan: __experimental_CommercePlanJSON;
  plan_period: string;
  status: string;
}

export interface __experimental_CommerceMoneyJSON {
  amount: number;
  amount_formatted: string;
  currency: string;
  currency_symbol: string;
}

export interface __experimental_CommerceTotalsJSON {
  grand_total: __experimental_CommerceMoneyJSON;
  subtotal: __experimental_CommerceMoneyJSON;
  tax_total: __experimental_CommerceMoneyJSON;
  total_due_now?: __experimental_CommerceMoneyJSON;
}

export interface __experimental_CommerceCheckoutJSON extends ClerkResourceJSON {
  object: 'commerce_checkout';
  id: string;
  external_client_secret: string;
  external_gateway_id: string;
  invoice?: __experimental_CommerceInvoiceJSON;
  payment_source?: __experimental_CommercePaymentSourceJSON;
  plan: __experimental_CommercePlanJSON;
  plan_period: string;
  status: string;
  subscription?: __experimental_CommerceSubscriptionJSON;
  totals: __experimental_CommerceTotalsJSON;
}
