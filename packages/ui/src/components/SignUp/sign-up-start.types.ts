import type { ClerkAPIError, PhoneCodeChannel, PhoneCodeChannelData, SignUpCreateParams } from '@clerk/shared/types';

import type { ActiveIdentifier, Fields } from './signUpFormHelpers';

export type SignUpStartFields = Pick<
  SignUpCreateParams,
  'firstName' | 'lastName' | 'emailAddress' | 'phoneNumber' | 'username' | 'password' | 'ticket' | 'legalAccepted'
>;

export type SignUpTicketData = {
  emailAddress: string;
  hasMissingRequirements: boolean;
  complete: () => Promise<void>;
};

export type SignUpStartData = {
  requestKey: string;
  canRun: () => boolean;
  initialValues: { firstName: string; lastName: string; emailAddress: string; username: string; phoneNumber: string };
  getInitialActiveIdentifier: () => ActiveIdentifier;
  legalConsentRequired: boolean;
  buildUsernameError: (errors: ClerkAPIError[]) => ClerkAPIError | string | undefined;
  buildPasswordError: (errors: ClerkAPIError[]) => ClerkAPIError | string | undefined;
  getTicket: () => string | null;
  hasExistingSignUpWithTicket: () => boolean;
  getFields: (identifier: ActiveIdentifier, hasTicket: boolean, hasEmail: boolean) => Fields;
  canToggleEmailPhone: boolean;
  createTicket: (ticket: string) => Promise<SignUpTicketData | undefined>;
  isRedirectingToSSOProvider: () => boolean;
  getOAuthError: () => ClerkAPIError | null;
  resetOAuthAttempt: () => Promise<void>;
  getAlternativePhoneCodeProvider: (channel: PhoneCodeChannel) => PhoneCodeChannelData | null;
  submit: (fields: SignUpStartFields, options: { useTicket: boolean; channel?: PhoneCodeChannel }) => Promise<void>;
  showOptionalFields: boolean;
  showFormFields: boolean;
  hasOauthProviders: boolean;
  hasWeb3Providers: boolean;
  hasAlternativePhoneCodeProviders: boolean;
  isPublicMode: boolean;
  isCombinedFlow: boolean;
  getSignInHref: () => string;
};
