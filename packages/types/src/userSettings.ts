import { OAuthStrategy } from './oauth';
import { ClerkResource } from './resource';

type Attribute =
  | 'email_address'
  | 'phone_number'
  | 'username'
  | 'first_name'
  | 'last_name'
  | 'password'
  | 'web3_wallet';

type VerificationStrategy = 'email_link' | 'email_code' | 'phone_code';

type OauthProviderData = {
  client_id: string;
  client_secret: string;
  name: string;
  provider: string;
  enabled: boolean;
  required: boolean;
  authenticatable: boolean;
  custom_profile: boolean;
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

type SignUpData = {
  allowlist_only: boolean;
};

export type OauthProviders = {
  [provider in OAuthStrategy]: OauthProviderData;
};

export type Attributes = {
  [attribute in Attribute]: AttributeData;
};

export type UserSettings = {
  social: OauthProviders;
  attributes: Attributes;
  sign_in: SignInData;
  sign_up: SignUpData;
};

export interface UserSettingsResource extends ClerkResource, UserSettings {
  id: string;
}
