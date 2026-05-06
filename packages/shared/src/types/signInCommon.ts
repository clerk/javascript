import type {
  BackupCodeAttempt,
  BackupCodeFactor,
  EmailCodeAttempt,
  EmailCodeConfig,
  EmailCodeFactor,
  EmailCodeSecondFactorConfig,
  EmailLinkConfig,
  EmailLinkFactor,
  EnterpriseSSOConfig,
  EnterpriseSSOFactor,
  OAuthConfig,
  OauthFactor,
  PasskeyAttempt,
  PassKeyConfig,
  PasskeyFactor,
  PasswordAttempt,
  PasswordFactor,
  PhoneCodeAttempt,
  PhoneCodeConfig,
  PhoneCodeFactor,
  PhoneCodeSecondFactorConfig,
  ResetPasswordEmailCodeAttempt,
  ResetPasswordEmailCodeFactor,
  ResetPasswordEmailCodeFactorConfig,
  ResetPasswordPhoneCodeAttempt,
  ResetPasswordPhoneCodeFactor,
  ResetPasswordPhoneCodeFactorConfig,
  TOTPAttempt,
  TOTPFactor,
  Web3Attempt,
  Web3SignatureConfig,
  Web3SignatureFactor,
} from './factors';
import type {
  EmailAddressIdentifier,
  PhoneNumberIdentifier,
  UsernameIdentifier,
  Web3WalletIdentifier,
} from './identifiers';
import type {
  AppleIdTokenStrategy,
  BackupCodeStrategy,
  EmailCodeStrategy,
  EmailLinkStrategy,
  EnterpriseSSOStrategy,
  GoogleOneTapStrategy,
  OAuthStrategy,
  PasskeyStrategy,
  PasswordStrategy,
  PhoneCodeStrategy,
  ResetPasswordEmailCodeStrategy,
  ResetPasswordPhoneCodeStrategy,
  TicketStrategy,
  TOTPStrategy,
  Web3Strategy,
} from './strategies';
import type { StartEmailLinkFlowParams } from './verification';

/**
 * @property {string} 'needs_identifier' - The user's identifier (e.g., email address, phone number, username) hasn't been provided.
 * @property {string} 'needs_first_factor' - One of the following [first factor verification](!first-factor-verification) strategies is missing: `'email_link'`, `'email_code'`, `passkey`, `password`, `'phone_code'`, `'web3_base_signature'`, `'web3_metamask_signature'`, `'web3_coinbase_wallet_signature'`, `'web3_okx_wallet_signature'`, `'web3_solana_signature'`, [`OAuthStrategy`](https://clerk.com/docs/reference/types/sso#o-auth-strategy), or `'enterprise_sso'`.
 * @property {string} 'needs_second_factor' - One of the following [second factor verification](!second-factor-verification) strategies is missing: `'phone_code'`, `'totp'`, `'backup_code'`, `'email_code'`, or `'email_link'`.
 * @property {string} 'needs_client_trust' - The user is signing in from a new device and must complete a [second factor verification](!second-factor-verification) to establish [Client Trust](https://clerk.com/docs/guides/secure/client-trust). See the [Client Trust custom flow guide](https://clerk.com/docs/guides/development/custom-flows/authentication/client-trust) for more information.
 * @property {string} 'needs_new_password' - The user needs to set a new password. See the [dedicated custom flow](https://clerk.com/docs/guides/development/custom-flows/account-updates/forgot-password) guide for more information.
 *
 * @interface
 * @inline
 */
export type SignInStatus =
  | 'needs_identifier'
  | 'needs_first_factor'
  | 'needs_second_factor'
  | 'needs_client_trust'
  | 'needs_new_password'
  | 'complete';

export type SignInIdentifier =
  | UsernameIdentifier
  | EmailAddressIdentifier
  | PhoneNumberIdentifier
  | Web3WalletIdentifier;

export type SignInFirstFactor =
  | EmailCodeFactor
  | EmailLinkFactor
  | PhoneCodeFactor
  | PasswordFactor
  | PasskeyFactor
  | ResetPasswordPhoneCodeFactor
  | ResetPasswordEmailCodeFactor
  | Web3SignatureFactor
  | OauthFactor
  | EnterpriseSSOFactor;

export type SignInSecondFactor = PhoneCodeFactor | TOTPFactor | BackupCodeFactor | EmailCodeFactor | EmailLinkFactor;

export interface UserData {
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  hasImage?: boolean;
}

export type SignInFactor = SignInFirstFactor | SignInSecondFactor;

export type PrepareFirstFactorParams =
  | EmailCodeConfig
  | EmailLinkConfig
  | PhoneCodeConfig
  | Web3SignatureConfig
  | PassKeyConfig
  | ResetPasswordPhoneCodeFactorConfig
  | ResetPasswordEmailCodeFactorConfig
  | OAuthConfig
  | EnterpriseSSOConfig;

export type AttemptFirstFactorParams =
  | PasskeyAttempt
  | EmailCodeAttempt
  | PhoneCodeAttempt
  | PasswordAttempt
  | Web3Attempt
  | ResetPasswordPhoneCodeAttempt
  | ResetPasswordEmailCodeAttempt;

export type PrepareSecondFactorParams = PhoneCodeSecondFactorConfig | EmailCodeSecondFactorConfig | EmailLinkConfig;

export type AttemptSecondFactorParams = PhoneCodeAttempt | TOTPAttempt | BackupCodeAttempt | EmailCodeAttempt;

export type SignInCreateParams = (
  | {
      strategy: OAuthStrategy | EnterpriseSSOStrategy;
      redirectUrl: string;
      actionCompleteRedirectUrl?: string;
      identifier?: string;
      oidcPrompt?: string;
      oidcLoginHint?: string;
    }
  | {
      strategy: TicketStrategy;
      ticket: string;
    }
  | {
      strategy: GoogleOneTapStrategy;
      token: string;
    }
  | {
      strategy: AppleIdTokenStrategy;
      token: string;
    }
  | {
      strategy: PasswordStrategy;
      password: string;
      identifier: string;
    }
  | { strategy: PasskeyStrategy }
  | {
      strategy:
        | PhoneCodeStrategy
        | EmailCodeStrategy
        | Web3Strategy
        | ResetPasswordEmailCodeStrategy
        | ResetPasswordPhoneCodeStrategy;
      identifier: string;
    }
  | {
      strategy: EmailLinkStrategy;
      identifier: string;
      redirectUrl?: string;
    }
  | {
      identifier: string;
    }
  | {
      transfer?: boolean;
    }
) & {
  transfer?: boolean;
  signUpIfMissing?: boolean;
};

export type ResetPasswordParams = {
  password: string;
  signOutOfOtherSessions?: boolean;
};

export type AuthenticateWithPasskeyParams = {
  flow?: 'autofill' | 'discoverable';
};

export interface SignInStartEmailLinkFlowParams extends StartEmailLinkFlowParams {
  emailAddressId: string;
}

export type SignInStrategy =
  | PasskeyStrategy
  | PasswordStrategy
  | ResetPasswordPhoneCodeStrategy
  | ResetPasswordEmailCodeStrategy
  | PhoneCodeStrategy
  | EmailCodeStrategy
  | EmailLinkStrategy
  | TicketStrategy
  | Web3Strategy
  | TOTPStrategy
  | BackupCodeStrategy
  | OAuthStrategy
  | EnterpriseSSOStrategy;

export interface SignInAuthenticateWithSolanaParams {
  walletName: string;
}
