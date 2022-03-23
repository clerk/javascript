import { ClerkResourceJSON } from './json';
import { ClerkResource } from './resource';
import { OAuthStrategy, Web3Strategy } from './strategies';

type Attribute =
  | 'email_address'
  | 'phone_number'
  | 'username'
  | 'first_name'
  | 'last_name'
  | 'password'
  | 'web3_wallet';

type VerificationStrategy = 'email_link' | 'email_code' | 'phone_code';

export type OAuthProviderSettings = {
  enabled: boolean;
  required: boolean;
  authenticatable: boolean;
  strategy: OAuthStrategy;
};

export type AttributeData = {
  enabled: boolean;
  required: boolean;
  name: Attribute;
  verifications: VerificationStrategy[];
  used_for_first_factor: boolean;
  first_factors: VerificationStrategy[];
  used_for_second_factor: boolean;
  second_factors: VerificationStrategy[];
  verify_at_sign_up: boolean;
};

export type SignInData = {
  second_factor: {
    required: boolean;
    enabled: boolean;
  };
};

export type SignUpData = {
  allowlist_only: boolean;
};

export type OAuthProviders = {
  [provider in OAuthStrategy]: OAuthProviderSettings;
};

export type Attributes = {
  [attribute in Attribute]: AttributeData;
};

export interface UserSettingsJSON extends ClerkResourceJSON {
  id: never;
  object: never;
  attributes: Attributes;
  social: OAuthProviders;
  sign_in: SignInData;
  sign_up: SignUpData;
}

export interface UserSettingsResource extends ClerkResource {
  id: undefined;
  social: OAuthProviders;
  attributes: Attributes;
  signIn: SignInData;
  signUp: SignUpData;
  socialProviderStrategies: OAuthStrategy[];
  web3FirstFactors: Web3Strategy[];
  enabledFirstFactorIdentifiers: Attribute[];
  instanceIsPasswordBased: boolean;
}
