import type {
  BackupCodeAttempt,
  BackupCodeFactor,
  EmailCodeAttempt,
  EmailCodeConfig,
  EmailCodeFactor,
  EmailLinkConfig,
  EmailLinkFactor,
  OAuthConfig,
  OauthFactor,
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
  SamlConfig,
  SamlFactor,
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
  ClerkResourceJSON,
  SignInFirstFactorJSON,
  SignInSecondFactorJSON,
  UserDataJSON,
  VerificationJSON,
} from './json';
import type { ValidatePasswordCallbacks } from './passwords';
import type { AuthenticateWithRedirectParams } from './redirects';
import type { ClerkResource } from './resource';
import type {
  BackupCodeStrategy,
  EmailCodeStrategy,
  EmailLinkStrategy,
  OAuthStrategy,
  PasswordStrategy,
  PhoneCodeStrategy,
  ResetPasswordEmailCodeStrategy,
  ResetPasswordPhoneCodeStrategy,
  SamlStrategy,
  TicketStrategy,
  TOTPStrategy,
  Web3Strategy,
} from './strategies';
import type { CreateEmailLinkFlowReturn, StartEmailLinkFlowParams, VerificationResource } from './verification';
import type { AuthenticateWithWeb3Params } from './web3Wallet';

export interface SignInResource extends ClerkResource {
  status: SignInStatus | null;
  supportedIdentifiers: SignInIdentifier[];
  supportedFirstFactors: SignInFirstFactor[];
  supportedSecondFactors: SignInSecondFactor[];
  firstFactorVerification: VerificationResource;
  secondFactorVerification: VerificationResource;
  identifier: string | null;
  createdSessionId: string | null;
  userData: UserData;

  create: (params: SignInCreateParams) => Promise<SignInResource>;

  resetPassword: (params: ResetPasswordParams) => Promise<SignInResource>;

  prepareFirstFactor: (params: PrepareFirstFactorParams) => Promise<SignInResource>;

  attemptFirstFactor: (params: AttemptFirstFactorParams) => Promise<SignInResource>;

  prepareSecondFactor: (params: PrepareSecondFactorParams) => Promise<SignInResource>;

  attemptSecondFactor: (params: AttemptSecondFactorParams) => Promise<SignInResource>;

  authenticateWithRedirect: (params: AuthenticateWithRedirectParams) => Promise<void>;

  authenticateWithWeb3: (params: AuthenticateWithWeb3Params) => Promise<SignInResource>;

  authenticateWithMetamask: () => Promise<SignInResource>;

  __experimental_authenticateWithPasskey: () => Promise<SignInResource>;

  createEmailLinkFlow: () => CreateEmailLinkFlowReturn<SignInStartEmailLinkFlowParams, SignInResource>;

  validatePassword: (password: string, callbacks?: ValidatePasswordCallbacks) => void;
}

export type SignInStatus =
  | 'needs_identifier'
  | 'needs_first_factor'
  | 'needs_second_factor'
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
  // TODO-PASSKEYS: Include this when the feature is not longer considered experimental
  // | __experimental_PasskeyFactor
  | ResetPasswordPhoneCodeFactor
  | ResetPasswordEmailCodeFactor
  | Web3SignatureFactor
  | OauthFactor
  | SamlFactor;

export type SignInSecondFactor = PhoneCodeFactor | TOTPFactor | BackupCodeFactor;

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
  // TODO-PASSKEYS: Include this when the feature is not longer considered experimental
  // | __experimental_PassKeyConfig
  | ResetPasswordPhoneCodeFactorConfig
  | ResetPasswordEmailCodeFactorConfig
  | OAuthConfig
  | SamlConfig;

export type AttemptFirstFactorParams =
  // TODO-PASSKEYS: Include this when the feature is not longer considered experimental
  // | __experimental_PasskeyAttempt
  | EmailCodeAttempt
  | PhoneCodeAttempt
  | PasswordAttempt
  | Web3Attempt
  | ResetPasswordPhoneCodeAttempt
  | ResetPasswordEmailCodeAttempt;

export type PrepareSecondFactorParams = PhoneCodeSecondFactorConfig;

export type AttemptSecondFactorParams = PhoneCodeAttempt | TOTPAttempt | BackupCodeAttempt;

export type SignInCreateParams = (
  | {
      strategy: OAuthStrategy | SamlStrategy;
      redirectUrl: string;
      actionCompleteRedirectUrl?: string;
      identifier?: string;
    }
  | {
      strategy: TicketStrategy;
      ticket: string;
    }
  | {
      strategy: PasswordStrategy;
      password: string;
      identifier: string;
    }
  // TODO-PASSKEYS: Include this when the feature is not longer considered experimental
  // | { strategy: __experimental_PasskeyStrategy }
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
  | { transfer?: boolean }
) & { transfer?: boolean };

export type ResetPasswordParams = {
  password: string;
  signOutOfOtherSessions?: boolean;
};

export interface SignInStartEmailLinkFlowParams extends StartEmailLinkFlowParams {
  emailAddressId: string;
}

export type SignInStrategy =
  // TODO-PASSKEYS: Include this when the feature is not longer considered experimental
  // | __experimental_PasskeyStrategy
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
  | SamlStrategy;

export interface SignInJSON extends ClerkResourceJSON {
  object: 'sign_in';
  id: string;
  status: SignInStatus;
  supported_identifiers: SignInIdentifier[];
  supported_external_accounts: OAuthStrategy[];
  identifier: string;
  user_data: UserDataJSON;
  supported_first_factors: SignInFirstFactorJSON[];
  supported_second_factors: SignInSecondFactorJSON[];
  first_factor_verification: VerificationJSON | null;
  second_factor_verification: VerificationJSON | null;
  created_session_id: string | null;
}
