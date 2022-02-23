/**
 * Currently representing API DTOs in their JSON form.
 */

import { ToggleType, ToggleTypeWithRequire } from './authConfig';
import { EmailAddressVerificationStrategy } from './emailAddress';
import { OAuthStrategy } from './oauth';
import { SessionStatus } from './session';
import {
  IdentificationStrategy,
  PreferredSignInStrategy,
  SignInFactor,
  SignInIdentifier,
  SignInStatus,
  SignInStrategyName,
  UserData,
} from './signIn';
import { SignUpField, SignUpIdentificationField, SignUpStatus } from './signUp';
import {
  BoxShadow,
  Color,
  EmUnit,
  FontFamily,
  FontWeight,
  HexColor,
} from './theme';
import { VerificationStatus } from './verification';

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

export interface DisplayConfigJSON {
  object: 'display_config';
  id: string;
  instance_environment_type: string;
  application_name: string;
  theme: DisplayThemeJSON;
  preferred_sign_in_strategy: PreferredSignInStrategy;
  logo_image: ImageJSON;
  favicon_image: ImageJSON;
  backend_host: string;
  home_url: string;
  sign_in_url: string;
  sign_up_url: string;
  user_profile_url: string;
  after_sign_in_url: string;
  after_sign_up_url: string;
  after_sign_out_url: string;
  after_sign_out_one_url: string;
  after_sign_out_all_url: string;
  after_switch_session_url: string;
  branded: boolean;
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
  unsafe_metadata: Record<string, unknown>;
  created_session_id: string | null;
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
  user: UserJSON;
  public_user_data: PublicUserDataJSON;
  created_at: number;
  updated_at: number;
}

export interface SignInJSON extends ClerkResourceJSON {
  object: 'sign_in';
  id: string;
  status: SignInStatus;
  supported_identifiers: SignInIdentifier[];
  supported_external_accounts: OAuthStrategy[];
  identifier: string;
  user_data: UserData;
  supported_first_factors: SignInFactor[];
  supported_second_factors: SignInFactor[];
  first_factor_verification: VerificationJSON | null;
  second_factor_verification: VerificationJSON | null;
  created_session_id: string | null;
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
}

export interface Web3WalletJSON extends ClerkResourceJSON {
  object: 'web3_wallet';
  id: string;
  web3_wallet: string;
  verification: VerificationJSON | null;
}

export interface UserJSON extends ClerkResourceJSON {
  object: 'user';
  id: string;
  primary_email_address_id: string;
  primary_phone_number_id: string;
  primary_web3_wallet_id: string;
  profile_image_url: string;
  username: string;
  email_addresses: EmailAddressJSON[];
  phone_numbers: PhoneNumberJSON[];
  web3_wallets: Web3WalletJSON[];
  external_accounts: ExternalAccountJSON[];
  password_enabled: boolean;
  password: string;
  profile_image_id: string;
  first_name: string;
  last_name: string;
  public_metadata: Record<string, unknown>;
  unsafe_metadata: Record<string, unknown>;
  updated_at: number;
  created_at: number;
}

export interface PublicUserDataJSON extends ClerkResourceJSON {
  first_name: string | null;
  last_name: string | null;
  profile_image_url: string;
  identifier: string;
}

export interface SessionWithActivitiesJSON extends Omit<SessionJSON, 'user'> {
  user: null;
  latest_activity: SessionActivityJSON;
  // activities: SessionActivityJSON[];
}

export interface AuthConfigJSON {
  object: 'auth_config';
  id: string;
  first_name: ToggleTypeWithRequire;
  last_name: ToggleTypeWithRequire;
  email_address: ToggleType;
  phone_number: ToggleType;
  username: ToggleType;
  password: ToggleTypeWithRequire;
  identification_strategies: IdentificationStrategy[];
  identification_requirements: IdentificationStrategy[][];
  password_conditions: any;
  first_factors: SignInStrategyName[];
  second_factors: SignInStrategyName[];
  email_address_verification_strategies: EmailAddressVerificationStrategy[];
  single_session_mode: boolean;
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

// TODO: Generalize external account JSON payload to simplify type declarations
export type ExternalAccountJSON =
  | {
      object: 'google_account';
      id: string;
      google_id: string;
      approved_scopes: string;
      email_address: string;
      given_name: string;
      family_name: string;
      picture: string;
    }
  | {
      object: 'facebook_account';
      id: string;
      facebook_id: string;
      approved_scopes: string;
      email_address: string;
      first_name: string;
      last_name: string;
      picture: string;
    }
  | {
      object: 'external_account';
      provider: string;
      identification_id: string;
      provider_user_id: string;
      approved_scopes: string;
      email_address: string;
      first_name: string;
      last_name: string;
      avatar_url: string;
    };
