import {
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
  Web3Attempt,
  Web3SignatureConfig,
  Web3SignatureFactor,
} from './factors';
import { EmailAddressIdentifier, PhoneNumberIdentifier, UsernameIdentifier, Web3WalletIdentifier } from './identifiers';
import {
  ClerkResourceJSON,
  SignInFirstFactorJSON,
  SignInSecondFactorJSON,
  UserDataJSON,
  VerificationJSON,
} from './json';
import { AuthenticateWithRedirectParams } from './oauth';
import { ClerkResource } from './resource';
import {
  EmailCodeStrategy,
  EmailLinkStrategy,
  OAuthStrategy,
  PasswordStrategy,
  PhoneCodeStrategy,
  TicketStrategy,
  Web3Strategy,
} from './strategies';
import { CreateMagicLinkFlowReturn, StartMagicLinkFlowParams, VerificationResource } from './verification';
import { AuthenticateWithWeb3Params } from './web3Wallet';

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

  prepareFirstFactor: (params: PrepareFirstFactorParams) => Promise<SignInResource>;

  attemptFirstFactor: (params: AttemptFirstFactorParams) => Promise<SignInResource>;

  prepareSecondFactor: (params: PrepareSecondFactorParams) => Promise<SignInResource>;

  attemptSecondFactor: (params: AttemptSecondFactorParams) => Promise<SignInResource>;

  authenticateWithRedirect: (params: AuthenticateWithRedirectParams) => Promise<void>;

  authenticateWithWeb3: (params: AuthenticateWithWeb3Params) => Promise<SignInResource>;

  authenticateWithMetamask: () => Promise<SignInResource>;

  createMagicLinkFlow: () => CreateMagicLinkFlowReturn<SignInStartMagicLinkFlowParams, SignInResource>;
}

export type SignInStatus = 'needs_identifier' | 'needs_first_factor' | 'needs_second_factor' | 'complete';

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
  | Web3SignatureFactor
  | OauthFactor;

export type SignInSecondFactor = PhoneCodeFactor;

export interface UserData {
  firstName?: string;
  lastName?: string;
  profileImageUrl?: string;
}

export type SignInFactor = SignInFirstFactor | SignInSecondFactor;

export type PrepareFirstFactorParams =
  | EmailCodeConfig
  | EmailLinkConfig
  | PhoneCodeConfig
  | Web3SignatureConfig
  | OAuthConfig;

export type AttemptFirstFactorParams = EmailCodeAttempt | PhoneCodeAttempt | PasswordAttempt | Web3Attempt;

export type PrepareSecondFactorParams = PhoneCodeSecondFactorConfig;

export type AttemptSecondFactorParams = PhoneCodeAttempt;

export type SignInCreateParams = (
  | {
      strategy: OAuthStrategy;
      redirectUrl: string;
      actionCompleteRedirectUrl?: string;
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
  | {
      strategy: PhoneCodeStrategy | EmailCodeStrategy | Web3Strategy;
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

export interface SignInStartMagicLinkFlowParams extends StartMagicLinkFlowParams {
  emailAddressId: string;
}

export type SignInStrategy =
  | PasswordStrategy
  | PhoneCodeStrategy
  | EmailCodeStrategy
  | EmailLinkStrategy
  | TicketStrategy
  | Web3Strategy
  | OAuthStrategy;

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
