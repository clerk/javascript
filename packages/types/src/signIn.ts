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
  GoogleOneTapStrategy,
  OAuthStrategy,
  PasskeyStrategy,
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
  /**
   * @deprecated This attribute will be removed in the next major version
   */
  supportedIdentifiers: SignInIdentifier[];
  supportedFirstFactors: SignInFirstFactor[];
  supportedSecondFactors: SignInSecondFactor[] | null;
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

  authenticateWithCoinbase: () => Promise<SignInResource>;

  authenticateWithPasskey: (params?: AuthenticateWithPasskeyParams) => Promise<SignInResource>;

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
  | PasskeyFactor
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
  | PassKeyConfig
  | ResetPasswordPhoneCodeFactorConfig
  | ResetPasswordEmailCodeFactorConfig
  | OAuthConfig
  | SamlConfig;

export type AttemptFirstFactorParams =
  | PasskeyAttempt
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
      strategy: GoogleOneTapStrategy;
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
  | { transfer?: boolean }
) & { transfer?: boolean };

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
  | SamlStrategy;

export interface SignInJSON extends ClerkResourceJSON {
  object: 'sign_in';
  id: string;
  status: SignInStatus;
  /**
   * @deprecated This attribute will be removed in the next major version
   */
  supported_identifiers: SignInIdentifier[];
  identifier: string;
  user_data: UserDataJSON;
  supported_first_factors: SignInFirstFactorJSON[];
  supported_second_factors: SignInSecondFactorJSON[];
  first_factor_verification: VerificationJSON | null;
  second_factor_verification: VerificationJSON | null;
  created_session_id: string | null;
}
