import type {
  Attribute,
  AuthenticateWithPasskeyParams,
  ClerkAPIError,
  LastAuthenticationStrategy,
  PhoneCodeChannel,
  SignInProps,
  SignUpModes,
} from '@clerk/shared/types';

import type { SignInStartIdentifier } from '../../common';

export type SignInStartField = {
  id: string;
  name?: string;
  value: string;
  checked?: boolean;
  type?: string;
};

export type SignInStartRecovery = 'retry_identifier' | 'handled' | 'ignored' | 'unhandled';

export type SignInStartModel = {
  requestKey: string;
  canRun: () => boolean;
  totalEnabledAuthMethods: number;
  identifierAttributes: SignInStartIdentifier[];
  initialValues: SignInProps['initialValues'];
  signUpUrl: string;
  waitlistUrl: string;
  isCombinedFlow: boolean;
  signUpMode: SignUpModes;
  standardFormAttributes: Attribute[];
  hasSocialOrWeb3Buttons: boolean;
  showAlternativePhoneCodeProviders: boolean;
  passwordBasedInstance: boolean;
  passkeyEnabled: boolean | undefined;
  showPasskeySignInButton: boolean;
  passkeyRequestKey: string;
  canAuthenticateWithPasskey: () => boolean;
  passkeyAutofillAllowed: boolean;
  checkPasskeyAutofillSupport: () => Promise<boolean>;
  authenticateWithPasskey: (params?: AuthenticateWithPasskeyParams) => Promise<void>;
  isWebSupported: boolean;
  organizationTicket: string;
  clerkStatus: string;
  buildUrlWithAuth: (url: string) => string;
  lastAuthenticationStrategy: LastAuthenticationStrategy | null | undefined;
  getFirstFactorError: () => { kind: 'api_error'; error: ClerkAPIError } | { kind: 'unknown' } | undefined;
  clearFirstFactorError: () => Promise<void>;
  navigateToTicketSignUp: (searchParams: URLSearchParams) => Promise<void>;
  createTicketSignIn: (ticket: string) => Promise<void>;
  submit: (
    fields: SignInStartField[],
    options: { channel?: PhoneCodeChannel; resetPasswordIntent?: boolean },
  ) => Promise<void>;
  recoverSignInError: (
    error: unknown,
    identifier: Pick<SignInStartField, 'type' | 'value'>,
    channel?: PhoneCodeChannel,
  ) => Promise<SignInStartRecovery>;
  isRedirectingToSSOProvider: () => boolean;
};
