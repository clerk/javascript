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

export type SignInStatus =
  | 'needs_identifier'
  | 'needs_first_factor'
  | 'needs_second_factor'
  | 'needs_client_trust'
  | 'needs_new_password'
  | 'needs_protect_check'
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

export type SignInSecondFactor =
  | PhoneCodeFactor
  | TOTPFactor
  | BackupCodeFactor
  | EmailCodeFactor
  | EmailLinkFactor
  | PasskeyFactor;

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

export type PrepareSecondFactorParams =
  | PhoneCodeSecondFactorConfig
  | EmailCodeSecondFactorConfig
  | EmailLinkConfig
  | PassKeyConfig;

export type AttemptSecondFactorParams =
  | PhoneCodeAttempt
  | TOTPAttempt
  | BackupCodeAttempt
  | EmailCodeAttempt
  | PasskeyAttempt;

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
  /**
   * The passkey flow to use when the passkey is the FIRST factor:
   * `'autofill'` (conditional UI) or `'discoverable'` both create a new
   * sign-in and identify the user from the passkey itself.
   *
   * Ignored when the sign-in is already in the `needs_second_factor` (or
   * `needs_client_trust`) status — autofill/discoverable are
   * identifier-first concepts, so the method always runs the discrete
   * prepare/attempt second-factor flow against the in-progress sign-in.
   */
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
