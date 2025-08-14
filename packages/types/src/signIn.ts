import type { SetActiveNavigate } from './clerk';
import type {
  BackupCodeAttempt,
  BackupCodeFactor,
  EmailCodeAttempt,
  EmailCodeConfig,
  EmailCodeFactor,
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
import type { AuthenticateWithPopupParams, AuthenticateWithRedirectParams } from './redirects';
import type { ClerkResource } from './resource';
import type { SignInJSONSnapshot } from './snapshots';
import type {
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
  SamlStrategy,
  TicketStrategy,
  TOTPStrategy,
  Web3Strategy,
} from './strategies';
import type { CreateEmailLinkFlowReturn, StartEmailLinkFlowParams, VerificationResource } from './verification';
import type { AuthenticateWithWeb3Params } from './web3Wallet';

/**
 * The `SignIn` object holds the state of the current sign-in and provides helper methods to navigate and complete the sign-in process. It is used to manage the sign-in lifecycle, including the first and second factor verification, and the creation of a new session.
 */
export interface SignInResource extends ClerkResource {
  /**
   * The current status of the sign-in.
   */
  status: SignInStatus | null;
  /**
   * @deprecated This attribute will be removed in the next major version.
   */
  supportedIdentifiers: SignInIdentifier[];
  supportedFirstFactors: SignInFirstFactor[] | null;
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

  authenticateWithPopup: (params: AuthenticateWithPopupParams) => Promise<void>;

  authenticateWithWeb3: (params: AuthenticateWithWeb3Params) => Promise<SignInResource>;

  authenticateWithMetamask: () => Promise<SignInResource>;

  authenticateWithCoinbaseWallet: () => Promise<SignInResource>;

  authenticateWithOKXWallet: () => Promise<SignInResource>;

  authenticateWithPasskey: (params?: AuthenticateWithPasskeyParams) => Promise<SignInResource>;

  createEmailLinkFlow: () => CreateEmailLinkFlowReturn<SignInStartEmailLinkFlowParams, SignInResource>;

  validatePassword: (password: string, callbacks?: ValidatePasswordCallbacks) => void;
  /**
   * @internal
   */
  __internal_toSnapshot: () => SignInJSONSnapshot;
}

export interface SignInFutureResource {
  availableStrategies: SignInFirstFactor[];
  status: SignInStatus | null;
  create: (params: {
    identifier?: string;
    strategy?: OAuthStrategy | 'saml' | 'enterprise_sso';
    redirectUrl?: string;
    actionCompleteRedirectUrl?: string;
  }) => Promise<{ error: unknown }>;
  password: (params: { identifier?: string; password: string }) => Promise<{ error: unknown }>;
  emailCode: {
    sendCode: (params: { email: string }) => Promise<{ error: unknown }>;
    verifyCode: (params: { code: string }) => Promise<{ error: unknown }>;
  };
  resetPasswordEmailCode: {
    sendCode: () => Promise<{ error: unknown }>;
    verifyCode: (params: { code: string }) => Promise<{ error: unknown }>;
    submitPassword: (params: { password: string; signOutOfOtherSessions?: boolean }) => Promise<{ error: unknown }>;
  };
  sso: (params: {
    flow?: 'auto' | 'modal';
    strategy: OAuthStrategy | 'saml' | 'enterprise_sso';
    redirectUrl: string;
    redirectUrlComplete: string;
  }) => Promise<{ error: unknown }>;
  finalize: (params: { navigate?: SetActiveNavigate }) => Promise<{ error: unknown }>;
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
  | SamlFactor
  | EnterpriseSSOFactor;

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
  | SamlConfig
  | EnterpriseSSOConfig;

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
      strategy: OAuthStrategy | SamlStrategy | EnterpriseSSOStrategy;
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
  | SamlStrategy
  | EnterpriseSSOStrategy;

export interface SignInJSON extends ClerkResourceJSON {
  object: 'sign_in';
  id: string;
  status: SignInStatus;
  /**
   * @deprecated This attribute will be removed in the next major version.
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
