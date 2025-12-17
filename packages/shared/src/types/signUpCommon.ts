import type { FirstNameAttribute, LastNameAttribute, LegalAcceptedAttribute, PasswordAttribute } from './attributes';
import type {
  EmailAddressIdentifier,
  EmailAddressOrPhoneNumberIdentifier,
  PhoneNumberIdentifier,
  UsernameIdentifier,
  Web3WalletIdentifier,
} from './identifiers';
import type { PhoneCodeChannel } from './phoneCodeChannel';
import type { SignUpVerificationJSONSnapshot, SignUpVerificationsJSONSnapshot } from './snapshots';
import type {
  AppleIdTokenStrategy,
  EmailCodeStrategy,
  EmailLinkStrategy,
  EnterpriseSSOStrategy,
  GoogleOneTapStrategy,
  OAuthStrategy,
  PhoneCodeStrategy,
  TicketStrategy,
  Web3Strategy,
} from './strategies';
import type { SnakeToCamel } from './utils';
import type { VerificationResource } from './verification';

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
      strategy: EnterpriseSSOStrategy;
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
export type SignUpIdentificationField = SignUpVerifiableField | OAuthStrategy | EnterpriseSSOStrategy;

// TODO: Replace with discriminated union type
export type SignUpCreateParams = Partial<
  {
    externalAccountStrategy: string;
    externalAccountRedirectUrl: string;
    externalAccountActionCompleteRedirectUrl: string;
    strategy:
      | OAuthStrategy
      | EnterpriseSSOStrategy
      | TicketStrategy
      | GoogleOneTapStrategy
      | AppleIdTokenStrategy
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
    locale?: string;
  } & Omit<SnakeToCamel<Record<SignUpAttributeField | SignUpVerifiableField, string>>, 'legalAccepted'>
>;

export type SignUpUpdateParams = SignUpCreateParams;

/**
 * @deprecated Use `SignUpAuthenticateWithWeb3Params` instead.
 */
export type SignUpAuthenticateWithMetamaskParams = SignUpAuthenticateWithWeb3Params;

export type SignUpAuthenticateWithWeb3Params = {
  unsafeMetadata?: SignUpUnsafeMetadata;
  legalAccepted?: boolean;
};

export type SignUpAuthenticateWithSolanaParams = SignUpAuthenticateWithWeb3Params & {
  walletName: string;
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
