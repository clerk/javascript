import type { PhoneCodeChannel } from 'phoneCodeChannel';

import type { FirstNameAttribute, LastNameAttribute, LegalAcceptedAttribute, PasswordAttribute } from './attributes';
import type { SetActiveNavigate } from './clerk';
import type { AttemptEmailAddressVerificationParams, PrepareEmailAddressVerificationParams } from './emailAddress';
import type {
  EmailAddressIdentifier,
  EmailAddressOrPhoneNumberIdentifier,
  PhoneNumberIdentifier,
  UsernameIdentifier,
  Web3WalletIdentifier,
} from './identifiers';
import type { ValidatePasswordCallbacks } from './passwords';
import type { AttemptPhoneNumberVerificationParams, PreparePhoneNumberVerificationParams } from './phoneNumber';
import type { AuthenticateWithPopupParams, AuthenticateWithRedirectParams } from './redirects';
import type { ClerkResource } from './resource';
import type { SignUpJSONSnapshot, SignUpVerificationJSONSnapshot, SignUpVerificationsJSONSnapshot } from './snapshots';
import type {
  EmailCodeStrategy,
  EmailLinkStrategy,
  EnterpriseSSOStrategy,
  GoogleOneTapStrategy,
  OAuthStrategy,
  PhoneCodeStrategy,
  SamlStrategy,
  TicketStrategy,
  Web3Strategy,
} from './strategies';
import type { SnakeToCamel } from './utils';
import type { CreateEmailLinkFlowReturn, StartEmailLinkFlowParams, VerificationResource } from './verification';
import type {
  AttemptWeb3WalletVerificationParams,
  AuthenticateWithWeb3Params,
  PrepareWeb3WalletVerificationParams,
} from './web3Wallet';

declare global {
  /**
   * If you want to provide custom types for the signUp.unsafeMetadata object,
   * simply redeclare this rule in the global namespace.
   * Every user object will use the provided type.
   */
  interface SignUpUnsafeMetadata {
    [k: string]: unknown;
  }
}

/**
 * The `SignUp` object holds the state of the current sign-up and provides helper methods to navigate and complete the sign-up process. Once a sign-up is complete, a new user is created.
 */
export interface SignUpResource extends ClerkResource {
  /**
   * The current status of the sign-up.
   */
  status: SignUpStatus | null;
  requiredFields: SignUpField[];
  optionalFields: SignUpField[];
  missingFields: SignUpField[];
  unverifiedFields: SignUpIdentificationField[];
  verifications: SignUpVerificationsResource;

  username: string | null;
  firstName: string | null;
  lastName: string | null;
  emailAddress: string | null;
  phoneNumber: string | null;
  web3wallet: string | null;
  hasPassword: boolean;
  unsafeMetadata: SignUpUnsafeMetadata;
  createdSessionId: string | null;
  createdUserId: string | null;
  abandonAt: number | null;
  legalAcceptedAt: number | null;

  create: (params: SignUpCreateParams) => Promise<SignUpResource>;

  update: (params: SignUpUpdateParams) => Promise<SignUpResource>;

  upsert: (params: SignUpCreateParams | SignUpUpdateParams) => Promise<SignUpResource>;

  prepareVerification: (params: PrepareVerificationParams) => Promise<SignUpResource>;

  attemptVerification: (params: AttemptVerificationParams) => Promise<SignUpResource>;

  prepareEmailAddressVerification: (params?: PrepareEmailAddressVerificationParams) => Promise<SignUpResource>;

  attemptEmailAddressVerification: (params: AttemptEmailAddressVerificationParams) => Promise<SignUpResource>;

  preparePhoneNumberVerification: (params?: PreparePhoneNumberVerificationParams) => Promise<SignUpResource>;

  attemptPhoneNumberVerification: (params: AttemptPhoneNumberVerificationParams) => Promise<SignUpResource>;

  prepareWeb3WalletVerification: (params?: PrepareWeb3WalletVerificationParams) => Promise<SignUpResource>;

  attemptWeb3WalletVerification: (params: AttemptWeb3WalletVerificationParams) => Promise<SignUpResource>;

  createEmailLinkFlow: () => CreateEmailLinkFlowReturn<StartEmailLinkFlowParams, SignUpResource>;

  validatePassword: (password: string, callbacks?: ValidatePasswordCallbacks) => void;

  authenticateWithRedirect: (
    params: AuthenticateWithRedirectParams & { unsafeMetadata?: SignUpUnsafeMetadata },
  ) => Promise<void>;

  authenticateWithPopup: (
    params: AuthenticateWithPopupParams & { unsafeMetadata?: SignUpUnsafeMetadata },
  ) => Promise<void>;

  authenticateWithWeb3: (
    params: AuthenticateWithWeb3Params & {
      unsafeMetadata?: SignUpUnsafeMetadata;
      legalAccepted?: boolean;
    },
  ) => Promise<SignUpResource>;

  authenticateWithMetamask: (params?: SignUpAuthenticateWithWeb3Params) => Promise<SignUpResource>;
  authenticateWithCoinbaseWallet: (params?: SignUpAuthenticateWithWeb3Params) => Promise<SignUpResource>;
  authenticateWithOKXWallet: (params?: SignUpAuthenticateWithWeb3Params) => Promise<SignUpResource>;
  __internal_toSnapshot: () => SignUpJSONSnapshot;
}

export interface SignUpFutureResource {
  status: SignUpStatus | null;
  unverifiedFields: SignUpIdentificationField[];
  verifications: {
    sendEmailCode: () => Promise<{ error: unknown }>;
    verifyEmailCode: (params: { code: string }) => Promise<{ error: unknown }>;
  };
  password: (params: { emailAddress: string; password: string }) => Promise<{ error: unknown }>;
  finalize: (params: { navigate?: SetActiveNavigate }) => Promise<{ error: unknown }>;
}

export type SignUpStatus = 'missing_requirements' | 'complete' | 'abandoned';

export type SignUpField = SignUpAttributeField | SignUpIdentificationField;

export type PrepareVerificationParams =
  | {
      strategy: EmailCodeStrategy;
    }
  | {
      strategy: EmailLinkStrategy;
      redirectUrl?: string;
    }
  | {
      strategy: PhoneCodeStrategy;
      channel?: PhoneCodeChannel;
    }
  | {
      strategy: Web3Strategy;
    }
  | {
      strategy: OAuthStrategy;
      redirectUrl?: string;
      actionCompleteRedirectUrl?: string;
      oidcPrompt?: string;
      oidcLoginHint?: string;
    }
  | {
      strategy: SamlStrategy | EnterpriseSSOStrategy;
      redirectUrl?: string;
      actionCompleteRedirectUrl?: string;
    };

export type AttemptVerificationParams =
  | {
      strategy: EmailCodeStrategy | PhoneCodeStrategy;
      code: string;
    }
  | {
      strategy: Web3Strategy;
      signature: string;
    };

export type SignUpAttributeField = FirstNameAttribute | LastNameAttribute | PasswordAttribute | LegalAcceptedAttribute;

// TODO: SignUpVerifiableField or SignUpIdentifier?
export type SignUpVerifiableField =
  | UsernameIdentifier
  | EmailAddressIdentifier
  | PhoneNumberIdentifier
  | EmailAddressOrPhoneNumberIdentifier
  | Web3WalletIdentifier;

// TODO: Does it make sense that the identification *field* holds a *strategy*?
export type SignUpIdentificationField = SignUpVerifiableField | OAuthStrategy | SamlStrategy | EnterpriseSSOStrategy;

// TODO: Replace with discriminated union type
export type SignUpCreateParams = Partial<
  {
    externalAccountStrategy: string;
    externalAccountRedirectUrl: string;
    externalAccountActionCompleteRedirectUrl: string;
    strategy:
      | OAuthStrategy
      | SamlStrategy
      | EnterpriseSSOStrategy
      | TicketStrategy
      | GoogleOneTapStrategy
      | PhoneCodeStrategy;
    redirectUrl: string;
    actionCompleteRedirectUrl: string;
    transfer: boolean;
    unsafeMetadata: SignUpUnsafeMetadata;
    ticket: string;
    token: string;
    legalAccepted: boolean;
    oidcPrompt: string;
    oidcLoginHint: string;
    channel: PhoneCodeChannel;
  } & Omit<SnakeToCamel<Record<SignUpAttributeField | SignUpVerifiableField, string>>, 'legalAccepted'>
>;

export type SignUpUpdateParams = SignUpCreateParams;

/**
 * @deprecated Use `SignUpAuthenticateWithWeb3Params` instead.
 */
export type SignUpAuthenticateWithMetamaskParams = SignUpAuthenticateWithWeb3Params;

export type SignUpAuthenticateWithWeb3Params = {
  unsafeMetadata?: SignUpUnsafeMetadata;
};

export interface SignUpVerificationsResource {
  emailAddress: SignUpVerificationResource;
  phoneNumber: SignUpVerificationResource;
  externalAccount: VerificationResource;
  web3Wallet: VerificationResource;
  __internal_toSnapshot: () => SignUpVerificationsJSONSnapshot;
}

export interface SignUpVerificationResource extends VerificationResource {
  supportedStrategies: string[];
  nextAction: string;
  __internal_toSnapshot: () => SignUpVerificationJSONSnapshot;
}
