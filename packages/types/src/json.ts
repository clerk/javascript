/**
 * Currently representing API DTOs in their JSON form.
 */

import type { FontFamily } from './appearance';
import type { DisplayConfigJSON } from './displayConfig';
import type { ActJWTClaim } from './jwt';
import type { OAuthProvider } from './oauth';
import type { OrganizationDomainVerificationStatus, OrganizationEnrollmentMode } from './organizationDomain';
import type { OrganizationInvitationStatus } from './organizationInvitation';
import type { MembershipRole, OrganizationPermissionKey } from './organizationMembership';
import type { OrganizationSettingsJSON } from './organizationSettings';
import type { OrganizationSuggestionStatus } from './organizationSuggestion';
import type { SamlIdpSlug } from './saml';
import type { SessionStatus } from './session';
import type { SignInFirstFactor, SignInJSON, SignInSecondFactor } from './signIn';
import type { SignUpField, SignUpIdentificationField, SignUpStatus } from './signUp';
import type { OAuthStrategy } from './strategies';
import type { BoxShadow, Color, EmUnit, FontWeight, HexColor } from './theme';
import type { UserSettingsJSON } from './userSettings';
import type { CamelToSnake } from './utils';
import type { VerificationStatus } from './verification';

export interface ClerkResourceJSON {
  // TODO: Shall we make this optional?
  id: string;
  object: string;
}

export interface DisplayThemeJSON {
  general: {
    color: HexColor;
    background_color: Color;
    font_family: FontFamily;
    font_color: HexColor;
    label_font_weight: FontWeight;
    padding: EmUnit;
    border_radius: EmUnit;
    box_shadow: BoxShadow;
  };
  buttons: {
    font_color: HexColor;
    font_family: FontFamily;
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
  display_config: DisplayConfigJSON;
  user_settings: UserSettingsJSON;
  organization_settings: OrganizationSettingsJSON;
  maintenance_mode: boolean;
}

export interface ClientJSON extends ClerkResourceJSON {
  object: 'client';
  id: string;
  status: any;
  sessions: SessionJSON[];
  sign_up: SignUpJSON | null;
  sign_in: SignInJSON | null;
  last_active_session_id: string | null;
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
  supported_external_accounts: OAuthStrategy[];
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
  verifications: SignUpVerificationsJSON | null;
}

export interface SessionJSON extends ClerkResourceJSON {
  object: 'session';
  id: string;
  status: SessionStatus;
  expire_at: number;
  abandon_at: number;
  last_active_at: number;
  last_active_token: TokenJSON;
  last_active_organization_id: string | null;
  actor: ActJWTClaim | null;
  user: UserJSON;
  public_user_data: PublicUserDataJSON;
  created_at: number;
  updated_at: number;
}

export interface EmailAddressJSON extends ClerkResourceJSON {
  object: 'email_address';
  email_address: string;
  verification: VerificationJSON | null;
  linked_to: IdentificationLinkJSON[];
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
  /**
   * @deprecated  Use `image_url` instead.
   */
  avatar_url: string;
  image_url: string;
  username: string;
  public_metadata: Record<string, unknown>;
  label: string;
  verification?: VerificationJSON;
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
}

export interface UserJSON extends ClerkResourceJSON {
  object: 'user';
  id: string;
  external_id: string;
  primary_email_address_id: string;
  primary_phone_number_id: string;
  primary_web3_wallet_id: string;
  /**
   * @deprecated  Use `image_url` instead.
   */
  profile_image_url: string;
  image_url: string;
  has_image: boolean;
  username: string;
  email_addresses: EmailAddressJSON[];
  phone_numbers: PhoneNumberJSON[];
  web3_wallets: Web3WalletJSON[];
  external_accounts: ExternalAccountJSON[];

  saml_accounts: SamlAccountJSON[];

  organization_memberships: OrganizationMembershipJSON[];
  password_enabled: boolean;
  profile_image_id: string;
  first_name: string;
  last_name: string;
  totp_enabled: boolean;
  backup_code_enabled: boolean;
  two_factor_enabled: boolean;
  public_metadata: UserPublicMetadata;
  unsafe_metadata: UserUnsafeMetadata;
  last_sign_in_at: number | null;
  create_organization_enabled: boolean;
  delete_self_enabled: boolean;
  updated_at: number;
  created_at: number;
}

export interface PublicUserDataJSON extends ClerkResourceJSON {
  first_name: string | null;
  last_name: string | null;
  /**
   * @deprecated  Use `image_url` instead.
   */
  profile_image_url: string;
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
  url_based_session_syncing: boolean;
}

export interface VerificationJSON extends ClerkResourceJSON {
  status: VerificationStatus;
  verified_at_client: string;
  strategy: string;
  nonce?: string;
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
  /**
   * @deprecated  Use `image_url` instead.
   */
  logo_url: string;
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
  role: MembershipRole;
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
  role: MembershipRole;
  created_at: number;
  updated_at: number;
}

interface OrganizationDomainVerificationJSON {
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

/**
 * @experimental
 */
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

/**
 * @experimental
 */
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
  role: MembershipRole;
  created_at: number;
  updated_at: number;
}

export interface UserDataJSON {
  first_name?: string;
  last_name?: string;
  /**
   * @deprecated  Use `image_url` instead.
   */
  profile_image_url?: string;
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
