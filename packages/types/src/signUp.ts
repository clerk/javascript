import {
  BirthdayAttribute,
  FirstNameAttribute,
  GenderAttribute,
  LastNameAttribute,
  PasswordAttribute,
} from './attributes';
import { AttemptEmailAddressVerificationParams, PrepareEmailAddressVerificationParams } from './emailAddress';
import {
  EmailAddressIdentifier,
  EmailAddressOrPhoneNumberIdentifier,
  PhoneNumberIdentifier,
  UsernameIdentifier,
  Web3WalletIdentifier,
} from './identifiers';
import { AuthenticateWithRedirectParams } from './oauth';
import { AttemptPhoneNumberVerificationParams, PreparePhoneNumberVerificationParams } from './phoneNumber';
import { ClerkResource } from './resource';
import {
  EmailCodeStrategy,
  EmailLinkStrategy,
  OAuthStrategy,
  OrganizationTicketStrategy,
  PhoneCodeStrategy,
  Web3Strategy,
} from './strategies';
import { SnakeToCamel } from './utils';
import { CreateMagicLinkFlowReturn, StartMagicLinkFlowParams, VerificationResource } from './verification';
import { AuthenticateWithWeb3Params, GenerateSignature } from './web3Wallet';

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
  hasPassword: boolean;
  unsafeMetadata: Record<string, unknown>;
  createdSessionId: string | null;
  abandonAt: number | null;

  create: (params: SignUpCreateParams) => Promise<SignUpResource>;

  update: (params: SignUpUpdateParams) => Promise<SignUpResource>;

  prepareVerification: (params: PrepareVerificationParams) => Promise<SignUpResource>;

  attemptVerification: (params: AttemptVerificationParams) => Promise<SignUpResource>;

  prepareEmailAddressVerification: (params?: PrepareEmailAddressVerificationParams) => Promise<SignUpResource>;

  attemptEmailAddressVerification: (params: AttemptEmailAddressVerificationParams) => Promise<SignUpResource>;

  preparePhoneNumberVerification: (params?: PreparePhoneNumberVerificationParams) => Promise<SignUpResource>;

  attemptPhoneNumberVerification: (params: AttemptPhoneNumberVerificationParams) => Promise<SignUpResource>;

  prepareWeb3WalletVerification: () => Promise<SignUpResource>;

  attemptWeb3WalletVerification: (params: AttemptWeb3WalletVerificationParams) => Promise<SignUpResource>;

  createMagicLinkFlow: () => CreateMagicLinkFlowReturn<StartMagicLinkFlowParams, SignUpResource>;

  authenticateWithRedirect: (params: AuthenticateWithRedirectParams) => Promise<void>;

  authenticateWithWeb3: (params: AuthenticateWithWeb3Params) => Promise<SignUpResource>;

  authenticateWithMetamask: () => Promise<SignUpResource>;
}

export type SignUpStatus = 'missing_requirements' | 'complete' | 'abandoned';

export type SignUpField = SignUpAttributeField | SignUpIdentificationField;

export type SignUpCreateParams = Partial<SnakeToCamel<SignUpAttributes> & SignUpAttributes>;

export type SignUpUpdateParams = SignUpCreateParams;

export type PrepareVerificationParams =
  | {
      strategy: EmailCodeStrategy;
    }
  | {
      strategy: EmailLinkStrategy;
      redirect_url?: string;
    }
  | {
      strategy: PhoneCodeStrategy;
    }
  | {
      strategy: Web3Strategy;
    };

export type AttemptVerificationParams =
  | {
      strategy: EmailCodeStrategy;
      code: string;
    }
  | {
      strategy: PhoneCodeStrategy;
      code: string;
    }
  | {
      strategy: Web3Strategy;
      signature: string;
    };

export type AttemptWeb3WalletVerificationParams = {
  generateSignature: GenerateSignature;
};

export type SignUpAttributeField =
  | FirstNameAttribute
  | LastNameAttribute
  | PasswordAttribute
  | BirthdayAttribute
  | GenderAttribute;

// TODO: SignUpVerifiableField or SignUpIdentifier?
export type SignUpVerifiableField =
  | UsernameIdentifier
  | EmailAddressIdentifier
  | PhoneNumberIdentifier
  | EmailAddressOrPhoneNumberIdentifier
  | Web3WalletIdentifier;

// TODO: Does it make sense that the identification *field* holds a *strategy*?
export type SignUpIdentificationField = SignUpVerifiableField | OAuthStrategy;

// TODO: Replace with discriminated union type
export type SignUpAttributes = {
  external_account_strategy: string;
  external_account_redirect_url: string;
  external_account_action_complete_redirect_url: string;
  strategy: OAuthStrategy | OrganizationTicketStrategy;
  redirect_url: string;
  action_complete_redirect_url: string;
  transfer: boolean;
  unsafe_metadata: Record<string, unknown>;
  invitation_token: string;
  ticket: string;
} & Record<SignUpAttributeField | SignUpVerifiableField, string>;

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
