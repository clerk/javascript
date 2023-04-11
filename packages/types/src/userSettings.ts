import type { ClerkResourceJSON } from './json';
import type { ClerkResource } from './resource';
import type { OAuthStrategy, Web3Strategy } from './strategies';

export type Attribute =
  | 'email_address'
  | 'phone_number'
  | 'username'
  | 'first_name'
  | 'last_name'
  | 'password'
  | 'web3_wallet'
  | 'authenticator_app'
  | 'backup_code';

export type VerificationStrategy = 'email_link' | 'email_code' | 'phone_code' | 'totp' | 'backup_code';

export type OAuthProviderSettings = {
  enabled: boolean;
  required: boolean;
  authenticatable: boolean;
  strategy: OAuthStrategy;
};

export type AttributeDataJSON = {
  enabled: boolean;
  required: boolean;
  verifications: VerificationStrategy[];
  used_for_first_factor: boolean;
  first_factors: VerificationStrategy[];
  used_for_second_factor: boolean;
  second_factors: VerificationStrategy[];
  verify_at_sign_up: boolean;
};

export type AttributeData = AttributeDataJSON & {
  name: Attribute;
};

export type SignInData = {
  second_factor: {
    required: boolean;
    enabled: boolean;
  };
};

export type SignUpData = {
  allowlist_only: boolean;
  progressive: boolean;
};

export type PasswordSettingsData = {
  disable_hibp: boolean;
  min_length: number;
  max_length: number;
  require_special_char: boolean;
  require_numbers: boolean;
  require_uppercase: boolean;
  require_lowercase: boolean;
  show_zxcvbn: boolean;
  min_zxcvbn_strength: number;
};

export type OAuthProviders = {
  [provider in OAuthStrategy]: OAuthProviderSettings;
};

export type AttributesJSON = {
  [attribute in Attribute]: AttributeDataJSON;
};

export type Attributes = {
  [attribute in Attribute]: AttributeData;
};

export interface UserSettingsJSON extends ClerkResourceJSON {
  id: never;
  object: never;
  attributes: AttributesJSON;
  social: OAuthProviders;
  sign_in: SignInData;
  sign_up: SignUpData;
  password_settings: PasswordSettingsData;
}

export interface UserSettingsResource extends ClerkResource {
  id?: undefined;
  social: OAuthProviders;
  attributes: Attributes;
  signIn: SignInData;
  signUp: SignUpData;
  passwordSettings: PasswordSettingsData;
  socialProviderStrategies: OAuthStrategy[];
  authenticatableSocialStrategies: OAuthStrategy[];
  web3FirstFactors: Web3Strategy[];
  enabledFirstFactorIdentifiers: Attribute[];
  instanceIsPasswordBased: boolean;
  hasValidAuthFactor: boolean;
}
