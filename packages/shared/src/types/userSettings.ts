import type { ClerkResourceJSON } from './json';
import type { PhoneCodeChannel } from './phoneCodeChannel';
import type { ClerkResource } from './resource';
import type { UserSettingsJSONSnapshot } from './snapshots';
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
  | 'backup_code'
  | 'passkey';

export type VerificationStrategy = 'email_link' | 'email_code' | 'phone_code' | 'totp' | 'backup_code';

export type OAuthProviderSettings = {
  enabled: boolean;
  required: boolean;
  authenticatable: boolean;
  strategy: OAuthStrategy;
  name: string;
  logo_url: string | null;
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
  channels?: PhoneCodeChannel[];
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

export type SignUpModes = 'public' | 'restricted' | 'waitlist';

export type SignUpData = {
  allowlist_only: boolean;
  progressive: boolean;
  captcha_enabled: boolean;
  mode: SignUpModes;
  legal_consent_enabled: boolean;
};

export type PasswordSettingsData = {
  allowed_special_characters: string;
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

export type UsernameSettingsData = {
  min_length: number;
  max_length: number;
};

export type PasskeySettingsData = {
  allow_autofill: boolean;
  show_sign_in_button: boolean;
};

export type OAuthProviders = {
  [provider in OAuthStrategy]: OAuthProviderSettings;
};
export type EnterpriseSSOSettings = {
  enabled: boolean;
};

export type AttributesJSON = {
  [attribute in Attribute]: AttributeDataJSON;
};

export type Attributes = {
  [attribute in Attribute]: AttributeData;
};

export type Actions = {
  delete_self: boolean;
  create_organization: boolean;
};

export interface UserSettingsJSON extends ClerkResourceJSON {
  id: never;
  object: never;
  attributes: AttributesJSON;
  actions: Actions;
  social: OAuthProviders;

  enterprise_sso: EnterpriseSSOSettings;

  sign_in: SignInData;
  sign_up: SignUpData;
  password_settings: PasswordSettingsData;
  passkey_settings: PasskeySettingsData;
  username_settings: UsernameSettingsData;
}

export interface UserSettingsResource extends ClerkResource {
  id?: undefined;
  social: OAuthProviders;

  enterpriseSSO: EnterpriseSSOSettings;

  attributes: Attributes;
  actions: Actions;
  signIn: SignInData;
  signUp: SignUpData;
  passwordSettings: PasswordSettingsData;
  usernameSettings: UsernameSettingsData;
  passkeySettings: PasskeySettingsData;
  socialProviderStrategies: OAuthStrategy[];
  authenticatableSocialStrategies: OAuthStrategy[];
  web3FirstFactors: Web3Strategy[];
  alternativePhoneCodeChannels: PhoneCodeChannel[];
  enabledFirstFactorIdentifiers: Attribute[];
  instanceIsPasswordBased: boolean;
  hasValidAuthFactor: boolean;
  __internal_toSnapshot: () => UserSettingsJSONSnapshot;
}
