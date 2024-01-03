import type {
  ClerkAPIError,
  EmailCodeStrategy,
  EmailLinkStrategy,
  EnvironmentResource,
  LoadedClerk,
  OAuthStrategy,
  PasswordStrategy,
  PhoneCodeStrategy,
  ResetPasswordEmailCodeStrategy,
  ResetPasswordPhoneCodeStrategy,
  SamlStrategy,
  TicketStrategy,
  Web3Strategy,
} from '@clerk/types';

export type FieldDetails = {
  type?: string;
  value?: string | readonly string[] | number;
  error?: ClerkAPIError;
};

export type WithClerk<T> = { clerk: LoadedClerkWithEnv } & T;
export type WithClient<T> = { client: LoadedClerkWithEnv['client'] } & T;
export type WithParams<T> = { params: T };

// ====================== CLERKJS MODIFICATIONS ======================

export interface LoadedClerkWithEnv extends LoadedClerk {
  mode: 'browser' | 'server';
  __unstable__environment: EnvironmentResource;
}

export interface SignInCreateOAuthParams {
  strategy: OAuthStrategy;
  redirectUrl: string;
  actionCompleteRedirectUrl?: string;
}

export interface SignInCreateSamlParams {
  // Split out from OAuthStrategy for better typing
  strategy: SamlStrategy;
  redirectUrl: string;
  actionCompleteRedirectUrl?: string;
  identifier: string;
}

export interface SignInCreateTicketParams {
  strategy: TicketStrategy;
  ticket: string;
}

export interface SignInCreatePasswordParams {
  strategy: PasswordStrategy;
  password: string;
  identifier: string;
}

export interface SignInCreateEmailLinkParams {
  strategy: EmailLinkStrategy;
  identifier: string;
  redirectUrl?: string;
}

export interface SignInCreateIdentifierOnlyParams {
  strategy?: never; // Added to fix typing issue
  identifier: string;
}

export interface SignInCreateTransferParams {
  transfer?: boolean;
}

export interface SignInCreateTransferOnlyParams extends SignInCreateTransferParams {
  strategy?: never; // Added to fix typing issue
}

export interface SignInCreateWeb3Params {
  strategy: Web3Strategy;
  identifier: string;
}

export interface SignInCreateCodeParams {
  strategy: PhoneCodeStrategy | EmailCodeStrategy | ResetPasswordEmailCodeStrategy | ResetPasswordPhoneCodeStrategy;
  identifier: string;
}

export type FixedSignInCreateParams = (
  | SignInCreateOAuthParams
  | SignInCreateSamlParams
  | SignInCreateTicketParams
  | SignInCreatePasswordParams
  | SignInCreateCodeParams
  | SignInCreateWeb3Params
  | SignInCreateEmailLinkParams
  | SignInCreateIdentifierOnlyParams
  | SignInCreateTransferOnlyParams
) &
  SignInCreateTransferParams;
