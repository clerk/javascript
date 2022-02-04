import {
  EmailAddressVerificationStrategy,
  PrepareEmailAddressVerificationParams,
} from './emailAddress';
import { AuthenticateWithRedirectParams, OAuthStrategy } from './oauth';
import {
  PhoneNumberVerificationStrategy,
  PreparePhoneNumberVerificationParams,
} from './phoneNumber';
import { ClerkResource } from './resource';
import { SnakeToCamel } from './utils';
import {
  CreateMagicLinkFlowReturn,
  StartMagicLinkFlowParams,
  VerificationAttemptParams,
  VerificationResource,
} from './verification';
import { Web3Strategy } from './web3';
import { AuthenticateWithWeb3Params } from './web3Wallet';

export interface SignUpResource extends ClerkResource {
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
  externalAccount: any;
  hasPassword: boolean;
  unsafeMetadata: Record<string, unknown>;
  createdSessionId: string | null;
  abandonAt: number | null;

  create: (params: SignUpParams) => Promise<SignUpResource>;

  update: (params: SignUpParams) => Promise<SignUpResource>;

  prepareVerification: (
    strategy: SignUpVerificationStrategy,
  ) => Promise<SignUpResource>;

  attemptVerification: (
    params: SignUpVerificationAttemptParams,
  ) => Promise<SignUpResource>;

  prepareEmailAddressVerification: (
    p?: PrepareEmailAddressVerificationParams,
  ) => Promise<SignUpResource>;

  attemptEmailAddressVerification: (
    params: VerificationAttemptParams,
  ) => Promise<SignUpResource>;

  createMagicLinkFlow: () => CreateMagicLinkFlowReturn<
    StartMagicLinkFlowParams,
    SignUpResource
  >;

  preparePhoneNumberVerification: (
    p?: PreparePhoneNumberVerificationParams,
  ) => Promise<SignUpResource>;

  attemptPhoneNumberVerification: (
    params: VerificationAttemptParams,
  ) => Promise<SignUpResource>;

  attemptWeb3WalletVerification: (
    params: AuthenticateWithWeb3Params,
  ) => Promise<SignUpResource>;

  authenticateWithRedirect: (
    params: AuthenticateWithRedirectParams,
  ) => Promise<void>;

  authenticateWithWeb3: (
    params: AuthenticateWithWeb3Params,
  ) => Promise<SignUpResource>;

  authenticateWithMetamask: () => Promise<SignUpResource>;
}

export type SignUpStatus = 'missing_requirements' | 'complete' | 'abandoned';

export type SignUpField = SignUpAttribute | SignUpIdentificationField;

export type SignUpIdentificationField =
  | 'email_address'
  | 'phone_number'
  | 'username'
  | 'email_address_or_phone_number'
  | 'web3_wallet';

export type SignUpIdentification = SignUpIdentificationField | OAuthStrategy;

export type SignUpAttribute =
  | 'first_name'
  | 'last_name'
  | 'password'
  | 'birthday'
  | 'gender';

export type SignUpAttributes = {
  external_account_strategy: string;
  external_account_redirect_url: string;
  external_account_action_complete_redirect_url: string;
  strategy: OAuthStrategy;
  redirect_url: string;
  action_complete_redirect_url: string;
  transfer: boolean;
  unsafe_metadata: Record<string, unknown>;
  invitation_token: string;
} & Record<
  SignUpAttribute | Exclude<SignUpIdentification, OAuthStrategy>,
  string
>;

export type SignUpParams = Partial<
  SnakeToCamel<SignUpAttributes> & SignUpAttributes
>;

export interface SignUpVerificationsResource {
  emailAddress: SignUpVerificationResource;
  phoneNumber: SignUpVerificationResource;
  externalAccount: VerificationResource;
  web3Wallet: VerificationResource;
}

export interface SignUpVerificationResource extends VerificationResource {
  supportedStrategies: string[];
  nextAction: string;
}

export type SignUpVerificationStrategy =
  | EmailAddressVerificationStrategy
  | PhoneNumberVerificationStrategy
  | Web3Strategy;

export type BaseVerificationAttemptParams = {
  strategy: SignUpVerificationStrategy;
};

export type SignUpVerificationAttemptParams = {
  strategy: SignUpVerificationStrategy;
} & VerificationAttemptParams;
