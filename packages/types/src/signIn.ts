import { EmailAddressVerificationStrategy } from './emailAddress';
import { AuthenticateWithRedirectParams, OAuthStrategy } from './oauth';
import { ClerkResource } from './resource';
import { SnakeToCamel } from './utils';
import {
  CreateMagicLinkFlowReturn,
  StartMagicLinkFlowParams,
  VerificationResource,
} from './verification';
import { Web3Strategy } from './web3';
import { AuthenticateWithWeb3Params } from './web3Wallet';

export interface SignInResource extends ClerkResource {
  status: SignInStatus | null;
  supportedIdentifiers: SignInIdentifier[];
  supportedFirstFactors: SignInFactor[];
  supportedSecondFactors: SignInFactor[];
  firstFactorVerification: VerificationResource;
  secondFactorVerification: VerificationResource;
  identifier: string | null;
  createdSessionId: string | null;
  userData: UserData;

  create: (params: SignInParams) => Promise<SignInResource>;

  prepareFirstFactor: (
    strategy: PrepareFirstFactorParams,
  ) => Promise<SignInResource>;

  attemptFirstFactor: (params: AttemptFactorParams) => Promise<SignInResource>;

  prepareSecondFactor: (
    params: PrepareSecondFactorParams,
  ) => Promise<SignInResource>;

  attemptSecondFactor: (params: AttemptFactorParams) => Promise<SignInResource>;

  authenticateWithRedirect: (
    params: AuthenticateWithRedirectParams,
  ) => Promise<void>;

  createMagicLinkFlow: () => CreateMagicLinkFlowReturn<
    SignInStartMagicLinkFlowParams,
    SignInResource
  >;

  authenticateWithWeb3: (
    params: AuthenticateWithWeb3Params,
  ) => Promise<SignInResource>;

  authenticateWithMetamask: () => Promise<SignInResource>;
}

export type AttemptFirstFactorWithMagicLinkParams = {
  email_address_id: string;
  redirect_url: string;
  signal?: AbortSignal;
};

export type SignInIdentifier =
  | 'username'
  | 'email_address'
  | 'phone_number'
  | 'web3_wallet';

export type IdentificationStrategy = SignInIdentifier | OAuthStrategy;

export type SignInStrategyName =
  | 'password'
  | 'phone_code'
  | Web3Strategy
  | EmailAddressVerificationStrategy
  | OAuthStrategy;

export type SignInStatus =
  | 'needs_identifier'
  | 'needs_first_factor'
  | 'needs_second_factor'
  | 'complete';

export type PreferredSignInStrategy = 'password' | 'otp';

export type EmailCodeFactor = {
  strategy: Extract<SignInStrategyName, 'email_code'>;
  email_address_id: string;
  safe_identifier: string;
};

export type EmailLinkFactor = {
  strategy: Extract<SignInStrategyName, 'email_link'>;
  email_address_id: string;
  safe_identifier: string;
};

export type PhoneCodeFactor = {
  strategy: Extract<SignInStrategyName, 'phone_code'>;
  phone_number_id: string;
  safe_identifier: string;
  default?: boolean;
};

export type Web3SignatureFactor = {
  strategy: Extract<SignInStrategyName, Web3Strategy>;
  web3_wallet_id: string;
};

export type PasswordFactor = {
  strategy: Extract<SignInStrategyName, 'password'>;
};

export type OauthFactor = {
  strategy: OAuthStrategy;
};

export type SignInFactor =
  | EmailCodeFactor
  | EmailLinkFactor
  | PhoneCodeFactor
  | PasswordFactor
  | Web3SignatureFactor
  | OauthFactor;

export type PrepareFirstFactorParams =
  | Omit<EmailCodeFactor, 'safe_identifier'>
  | (Omit<EmailLinkFactor, 'safe_identifier'> & { redirect_url: string })
  | Omit<PhoneCodeFactor, 'safe_identifier'>
  | Web3SignatureFactor
  | (OauthFactor & {
      redirect_url: string;
      action_complete_redirect_url: string;
    });

export type PrepareSecondFactorParams = Pick<PhoneCodeFactor, 'strategy'> & {
  phone_number_id?: string;
};

export type AttemptFactorParams =
  | {
      strategy: Extract<SignInStrategyName, 'email_code' | 'phone_code'>;
      code: string;
    }
  | {
      strategy: Extract<SignInStrategyName, 'password'>;
      password: string;
    }
  | {
      strategy: Extract<SignInStrategyName, Web3Strategy>;
      signature: string;
    };

export interface UserData {
  first_name?: string;
  last_name?: string;
  profile_image_url?: string;
}

type SignInAttributes = {
  /**
   * An email address, phone or username to identify the attempt.
   */
  identifier?: string;

  /**
   * The first step of the strategy to perform.
   */
  strategy?: SignInStrategyName;

  /**
   * Required if the strategy is "password".
   * The password to attempt to sign in with.
   */
  password?: string;

  /**
   * Required if the strategy is one of the OAuth providers.
   * This is the URL that the user will be redirected to after the OAuth verification completes.
   */
  redirect_url?: string;

  /**
   * Optional if the strategy is one of the OAuth providers.
   * If the OAuth verification results in a completed Sign in, this is the URL that
   * the user will be redirected to.
   */
  action_complete_redirect_url?: string;
} & { transfer: boolean };

export type SignInParams = Partial<
  SnakeToCamel<SignInAttributes> & SignInAttributes
>;

export interface SignInStartMagicLinkFlowParams
  extends StartMagicLinkFlowParams {
  emailAddressId: string;
}
