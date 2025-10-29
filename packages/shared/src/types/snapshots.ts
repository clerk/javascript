// this file contains the types returned by the __internal_toSnapshot method of the resources

import type { APIKeysSettingsJSON } from './apiKeysSettings';
import type { CommerceSettingsJSON } from './commerceSettings';
import type { DisplayConfigJSON } from './displayConfig';
import type {
  AuthConfigJSON,
  ClientJSON,
  ClientTrustState,
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
import type { Nullable, Override } from './utils';

export type SignInJSONSnapshot = Override<
  Nullable<
    SignInJSON,
    'status' | 'identifier' | 'supported_first_factors' | 'untrusted_first_factors' | 'supported_second_factors'
  >,
  {
    first_factor_verification: VerificationJSONSnapshot;
    second_factor_verification: VerificationJSONSnapshot;
    user_data: UserDataJSONSnapshot;
    client_trust_state?: ClientTrustState;
  }
>;

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

export type UserJSONSnapshot = Override<
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
  {
    external_accounts: ExternalAccountJSONSnapshot[];
    email_addresses: EmailAddressJSONSnapshot[];
    passkeys: PasskeyJSONSnapshot[];
    enterprise_accounts: EnterpriseAccountJSONSnapshot[];
    phone_numbers: PhoneNumberJSONSnapshot[];
    saml_accounts: SamlAccountJSONSnapshot[];
    web3_wallets: Web3WalletJSONSnapshot[];
  }
>;

export type ExternalAccountJSONSnapshot = Override<
  ExternalAccountJSON,
  {
    verification: VerificationJSONSnapshot | null;
  }
>;

export type SessionJSONSnapshot = Override<
  Nullable<SessionJSON, 'last_active_at' | 'last_active_token'>,
  {
    user: UserJSONSnapshot | null;
  }
>;

export type SignUpJSONSnapshot = Override<
  Nullable<SignUpJSON, 'status'>,
  {
    verifications: SignUpVerificationsJSONSnapshot;
  }
>;

export type ClientJSONSnapshot = Override<
  Nullable<ClientJSON, 'created_at' | 'updated_at'>,
  {
    sign_up: SignUpJSONSnapshot;
    sign_in: SignInJSONSnapshot;
    sessions: SessionJSONSnapshot[];
  }
>;

export type AuthConfigJSONSnapshot = AuthConfigJSON;

export type EnvironmentJSONSnapshot = EnvironmentJSON;

export type DisplayConfigJSONSnapshot = DisplayConfigJSON;

export type EmailAddressJSONSnapshot = Override<
  EmailAddressJSON,
  {
    verification: VerificationJSONSnapshot | null;
  }
>;

export type EnterpriseAccountJSONSnapshot = Override<
  EnterpriseAccountJSON,
  {
    verification: VerificationJSONSnapshot | null;
  }
>;

export type EnterpriseAccountConnectionJSONSnapshot = EnterpriseAccountConnectionJSON;

export type IdentificationLinkJSONSnapshot = IdentificationLinkJSON;

export type OrganizationJSONSnapshot = OrganizationJSON;

export type OrganizationMembershipJSONSnapshot = OrganizationMembershipJSON;

export type OrganizationSettingsJSONSnapshot = OrganizationSettingsJSON;

export type PasskeyJSONSnapshot = Override<PasskeyJSON, { verification: VerificationJSONSnapshot | null }>;

export type PhoneNumberJSONSnapshot = Override<
  PhoneNumberJSON,
  {
    verification: VerificationJSONSnapshot;
  }
>;

export type SamlAccountJSONSnapshot = Override<
  SamlAccountJSON,
  {
    verification: VerificationJSONSnapshot | null;
  }
>;

export type SamlAccountConnectionJSONSnapshot = SamlAccountConnectionJSON;

export type SignUpVerificationsJSONSnapshot = Override<
  SignUpVerificationsJSON,
  {
    external_account: VerificationJSONSnapshot;
    web3_wallet: SignUpVerificationJSONSnapshot;
    email_address: SignUpVerificationJSONSnapshot;
    phone_number: SignUpVerificationJSONSnapshot;
  }
>;

export type SignUpVerificationJSONSnapshot = Pick<SignUpVerificationJSON, 'next_action' | 'supported_strategies'> &
  VerificationJSONSnapshot;

export type TokenJSONSnapshot = TokenJSON;

export type UserSettingsJSONSnapshot = UserSettingsJSON;

export type Web3WalletJSONSnapshot = Override<
  Web3WalletJSON,
  {
    verification: VerificationJSONSnapshot | null;
  }
>;

export type PublicUserDataJSONSnapshot = PublicUserDataJSON;

export type CommerceSettingsJSONSnapshot = CommerceSettingsJSON;

export type APIKeysSettingsJSONSnapshot = APIKeysSettingsJSON;
