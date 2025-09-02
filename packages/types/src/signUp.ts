import type { AttemptEmailAddressVerificationParams, PrepareEmailAddressVerificationParams } from './emailAddress';
import type { ValidatePasswordCallbacks } from './passwords';
import type { AttemptPhoneNumberVerificationParams, PreparePhoneNumberVerificationParams } from './phoneNumber';
import type { AuthenticateWithPopupParams, AuthenticateWithRedirectParams } from './redirects';
import type { ClerkResource } from './resource';
import type {
  AttemptVerificationParams,
  PrepareVerificationParams,
  SignUpAuthenticateWithWeb3Params,
  SignUpCreateParams,
  SignUpField,
  SignUpIdentificationField,
  SignUpStatus,
  SignUpUpdateParams,
  SignUpVerificationsResource,
} from './signUpCommon';
import type { SignUpFutureResource } from './signUpFuture';
import type { SignUpJSONSnapshot } from './snapshots';
import type { CreateEmailLinkFlowReturn, StartEmailLinkFlowParams } from './verification';
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
  authenticateWithBase: (params?: SignUpAuthenticateWithWeb3Params) => Promise<SignUpResource>;
  __internal_toSnapshot: () => SignUpJSONSnapshot;

  /**
   * @internal
   */
  __internal_future: SignUpFutureResource;
}
