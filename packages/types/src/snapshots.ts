// this file contains the types returned by the toJSON method of the resources

import type { DisplayConfigJSON } from './displayConfig';
import type {
  AuthConfigJSON,
  ClientJSON,
  EmailAddressJSON,
  EnterpriseAccountConnectionJSON,
  EnterpriseAccountJSON,
  EnvironmentJSON,
  ExternalAccountJSON,
  IdentificationLinkJSON,
  OrganizationJSON,
  OrganizationMembershipJSON,
  PasskeyJSON,
  PhoneNumberJSON,
  PublicUserDataJSON,
  SamlAccountConnectionJSON,
  SamlAccountJSON,
  SessionJSON,
  SignUpJSON,
  SignUpVerificationJSON,
  SignUpVerificationsJSON,
  TokenJSON,
  UserDataJSON,
  UserJSON,
  VerificationJSON,
  Web3WalletJSON,
} from './json';
import type { OrganizationSettingsJSON } from './organizationSettings';
import type { SignInJSON } from './signIn';
import type { UserSettingsJSON } from './userSettings';
import type { Nullable } from './utils';

export type SignInJSONSnapshot = Omit<
  Nullable<SignInJSON, 'status' | 'identifier' | 'supported_first_factors' | 'supported_second_factors'>,
  'first_factor_verification' | 'second_factor_verification' | 'user_data'
> & {
  first_factor_verification: VerificationJSONSnapshot;
  second_factor_verification: VerificationJSONSnapshot;
  user_data: UserDataJSONSnapshot;
};

export type VerificationJSONSnapshot = Nullable<
  VerificationJSON,
  | 'status'
  | 'verified_at_client'
  | 'strategy'
  | 'nonce'
  | 'message'
  | 'external_verification_redirect_url'
  | 'attempts'
  | 'expire_at'
>;

export type UserDataJSONSnapshot = Nullable<UserDataJSON, 'image_url' | 'has_image'>;

export type UserJSONSnapshot = Omit<
  Nullable<
    UserJSON,
    | 'external_id'
    | 'primary_email_address_id'
    | 'primary_phone_number_id'
    | 'primary_web3_wallet_id'
    | 'username'
    | 'first_name'
    | 'last_name'
    | 'updated_at'
    | 'created_at'
  >,
  | 'external_accounts'
  | 'email_addresses'
  | 'passkeys'
  | 'enterprise_accounts'
  | 'phone_numbers'
  | 'saml_accounts'
  | 'web3_wallets'
> & {
  external_accounts: ExternalAccountJSONSnapshot[];
  email_addresses: EmailAddressJSONSnapshot[];
  passkeys: PasskeyJSONSnapshot[];
  enterprise_accounts: EnterpriseAccountJSONSnapshot[];
  phone_numbers: PhoneNumberJSONSnapshot[];
  saml_accounts: SamlAccountJSONSnapshot[];
  web3_wallets: Web3WalletJSONSnapshot[];
};

export type ExternalAccountJSONSnapshot = Omit<ExternalAccountJSON, 'verification'> & {
  verification: VerificationJSONSnapshot | null;
};

export type SessionJSONSnapshot = Omit<Nullable<SessionJSON, 'last_active_at' | 'last_active_token'>, 'user'> & {
  user: UserJSONSnapshot | null;
};

export type SignUpJSONSnapshot = Omit<Nullable<SignUpJSON, 'status'>, 'verifications'> & {
  verifications: SignUpVerificationsJSONSnapshot;
};

export type ClientJSONSnapshot = Omit<
  Nullable<ClientJSON, 'created_at' | 'updated_at'>,
  'sign_up' | 'sign_in' | 'sessions'
> & {
  sign_up: SignUpJSONSnapshot;
  sign_in: SignInJSONSnapshot;
  sessions: SessionJSONSnapshot[];
};

export type AuthConfigJSONSnapshot = AuthConfigJSON;

export type EnvironmentJSONSnapshot = EnvironmentJSON;

export type DisplayConfigJSONSnapshot = DisplayConfigJSON;

export type EmailAddressJSONSnapshot = Omit<EmailAddressJSON, 'verification'> & {
  verification: VerificationJSONSnapshot | null;
};

export type EnterpriseAccountJSONSnapshot = Omit<EnterpriseAccountJSON, 'verification'> & {
  verification: VerificationJSONSnapshot | null;
};

export type EnterpriseAccountConnectionJSONSnapshot = EnterpriseAccountConnectionJSON;

export type IdentificationLinkJSONSnapshot = IdentificationLinkJSON;

export type OrganizationJSONSnapshot = OrganizationJSON;

export type OrganizationMembershipJSONSnapshot = OrganizationMembershipJSON;

export type OrganizationSettingsJSONSnapshot = OrganizationSettingsJSON;

export type PasskeyJSONSnapshot = Omit<PasskeyJSON, 'verification'> & { verification: VerificationJSONSnapshot | null };

export type PhoneNumberJSONSnapshot = Omit<PhoneNumberJSON, 'verification'> & {
  verification: VerificationJSONSnapshot;
};

export type SamlAccountJSONSnapshot = Omit<SamlAccountJSON, 'verification'> & {
  verification: VerificationJSONSnapshot | null;
};

export type SamlAccountConnectionJSONSnapshot = SamlAccountConnectionJSON;

export type SignUpVerificationsJSONSnapshot = Omit<
  SignUpVerificationsJSON,
  'external_account' | 'email_address' | 'phone_number' | 'web3_wallet'
> & {
  external_account: VerificationJSONSnapshot;
  web3_wallet: SignUpVerificationJSONSnapshot;
  email_address: SignUpVerificationJSONSnapshot;
  phone_number: SignUpVerificationJSONSnapshot;
};

export type SignUpVerificationJSONSnapshot = Pick<SignUpVerificationJSON, 'next_action' | 'supported_strategies'> &
  VerificationJSONSnapshot;

export type TokenJSONSnapshot = TokenJSON;

export type UserSettingsJSONSnapshot = UserSettingsJSON;

export type Web3WalletJSONSnapshot = Omit<Web3WalletJSON, 'verification'> & {
  verification: VerificationJSONSnapshot | null;
};

export type PublicUserDataJSONSnapshot = PublicUserDataJSON;
