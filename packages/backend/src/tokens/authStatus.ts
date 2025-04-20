import type { JwtPayload } from '@clerk/types';

import { constants } from '../constants';
import type { TokenVerificationErrorReason } from '../errors';
import type { AuthenticateContext } from './authenticateContext';
import type {
  AuthenticatedMachineObject,
  SignedInAuthObject,
  SignedOutAuthObject,
  UnauthenticatedMachineObject,
} from './authObjects';
import {
  authenticatedMachineObject,
  signedInAuthObject,
  signedOutAuthObject,
  unauthenticatedMachineObject,
} from './authObjects';
import type { MachineAuthType, NonSessionTokenType, TokenType } from './types';

export const AuthStatus = {
  SignedIn: 'signed-in',
  SignedOut: 'signed-out',
  Handshake: 'handshake',
} as const;

export type AuthStatus = (typeof AuthStatus)[keyof typeof AuthStatus];

type ToAuthSignedIn<T extends TokenType> = T extends 'session_token'
  ? () => SignedInAuthObject
  : () => AuthenticatedMachineObject & {
      tokenType: T;
    };

type ToAuthSignedOut<T extends TokenType> = T extends 'session_token'
  ? () => SignedOutAuthObject
  : () => UnauthenticatedMachineObject & { tokenType: T };

export type SignedInState<T extends TokenType = 'session_token'> = {
  status: typeof AuthStatus.SignedIn;
  reason: null;
  message: null;
  proxyUrl?: string;
  publishableKey: string;
  isSatellite: boolean;
  domain: string;
  signInUrl: string;
  signUpUrl: string;
  afterSignInUrl: string;
  afterSignUpUrl: string;
  /**
   * @deprecated Use `isAuthenticated` instead.
   */
  isSignedIn: true;
  isAuthenticated: true;
  headers: Headers;
  token: string;
  tokenType: T;
  toAuth: ToAuthSignedIn<T>;
};

export type SignedOutState<T extends TokenType = 'session_token'> = {
  status: typeof AuthStatus.SignedOut;
  message: string;
  reason: AuthReason;
  proxyUrl?: string;
  publishableKey: string;
  isSatellite: boolean;
  domain: string;
  signInUrl: string;
  signUpUrl: string;
  afterSignInUrl: string;
  afterSignUpUrl: string;
  /**
   * @deprecated Use `isAuthenticated` instead.
   */
  isSignedIn: false;
  isAuthenticated: false;
  headers: Headers;
  token: null;
  tokenType: T;
  toAuth: ToAuthSignedOut<T>;
};

export type HandshakeState = Omit<SignedOutState, 'status' | 'toAuth' | 'tokenType'> & {
  tokenType: 'session_token';
  status: typeof AuthStatus.Handshake;
  headers: Headers;
  toAuth: () => null;
};

export const AuthErrorReason = {
  ClientUATWithoutSessionToken: 'client-uat-but-no-session-token',
  DevBrowserMissing: 'dev-browser-missing',
  DevBrowserSync: 'dev-browser-sync',
  PrimaryRespondsToSyncing: 'primary-responds-to-syncing',
  SatelliteCookieNeedsSyncing: 'satellite-needs-syncing',
  SessionTokenAndUATMissing: 'session-token-and-uat-missing',
  SessionTokenMissing: 'session-token-missing',
  SessionTokenExpired: 'session-token-expired',
  SessionTokenIATBeforeClientUAT: 'session-token-iat-before-client-uat',
  SessionTokenNBF: 'session-token-nbf',
  SessionTokenIatInTheFuture: 'session-token-iat-in-the-future',
  SessionTokenWithoutClientUAT: 'session-token-but-no-client-uat',
  ActiveOrganizationMismatch: 'active-organization-mismatch',
  TokenTypeMismatch: 'token-type-mismatch',
  UnexpectedError: 'unexpected-error',
} as const;

export type AuthErrorReason = (typeof AuthErrorReason)[keyof typeof AuthErrorReason];

export type AuthReason = AuthErrorReason | TokenVerificationErrorReason;

export type RequestState<T extends TokenType = 'session_token'> =
  | SignedInState<T>
  | SignedOutState<T>
  | (T extends 'session_token' ? HandshakeState : never);

type BaseSignedInParams = {
  authenticateContext: AuthenticateContext;
  headers?: Headers;
  token: string;
  tokenType: TokenType;
};

type SignedInParams =
  | (BaseSignedInParams & { tokenType: 'session_token'; sessionClaims: JwtPayload })
  | (BaseSignedInParams & { tokenType: NonSessionTokenType; machineData: MachineAuthType });

export function signedIn<T extends TokenType>(params: SignedInParams & { tokenType: T }): SignedInState<T> {
  const { authenticateContext, headers = new Headers(), token } = params;

  const toAuth = () => {
    if (params.tokenType === 'session_token') {
      const { sessionClaims } = params as { sessionClaims: JwtPayload };
      return signedInAuthObject(authenticateContext, token, sessionClaims);
    }

    const { machineData } = params as { machineData: MachineAuthType };
    return authenticatedMachineObject(params.tokenType, token, machineData, authenticateContext);
  };

  return {
    status: AuthStatus.SignedIn,
    reason: null,
    message: null,
    proxyUrl: authenticateContext.proxyUrl || '',
    publishableKey: authenticateContext.publishableKey || '',
    isSatellite: authenticateContext.isSatellite || false,
    domain: authenticateContext.domain || '',
    signInUrl: authenticateContext.signInUrl || '',
    signUpUrl: authenticateContext.signUpUrl || '',
    afterSignInUrl: authenticateContext.afterSignInUrl || '',
    afterSignUpUrl: authenticateContext.afterSignUpUrl || '',
    isSignedIn: true,
    isAuthenticated: true,
    tokenType: params.tokenType,
    toAuth,
    headers,
    token,
  } as SignedInState<T>;
}

type SignedOutParams = Omit<BaseSignedInParams, 'token'> & {
  reason: AuthReason;
  message?: string;
};

export function signedOut<T extends TokenType>(params: SignedOutParams & { tokenType: T }): SignedOutState<T> {
  const { authenticateContext, headers = new Headers(), reason, message = '', tokenType } = params;

  const toAuth = () => {
    if (tokenType === 'session_token') {
      return signedOutAuthObject({ ...authenticateContext, status: AuthStatus.SignedOut, reason, message });
    }

    return unauthenticatedMachineObject(tokenType, { reason, message, headers });
  };

  return withDebugHeaders({
    status: AuthStatus.SignedOut,
    reason,
    message,
    proxyUrl: authenticateContext.proxyUrl || '',
    publishableKey: authenticateContext.publishableKey || '',
    isSatellite: authenticateContext.isSatellite || false,
    domain: authenticateContext.domain || '',
    signInUrl: authenticateContext.signInUrl || '',
    signUpUrl: authenticateContext.signUpUrl || '',
    afterSignInUrl: authenticateContext.afterSignInUrl || '',
    afterSignUpUrl: authenticateContext.afterSignUpUrl || '',
    isSignedIn: false,
    isAuthenticated: false,
    tokenType,
    toAuth,
    headers,
    token: null,
  }) as SignedOutState<T>;
}

export function handshake(
  authenticateContext: AuthenticateContext,
  reason: AuthReason,
  message = '',
  headers: Headers,
): HandshakeState {
  return withDebugHeaders({
    status: AuthStatus.Handshake,
    reason,
    message,
    publishableKey: authenticateContext.publishableKey || '',
    isSatellite: authenticateContext.isSatellite || false,
    domain: authenticateContext.domain || '',
    proxyUrl: authenticateContext.proxyUrl || '',
    signInUrl: authenticateContext.signInUrl || '',
    signUpUrl: authenticateContext.signUpUrl || '',
    afterSignInUrl: authenticateContext.afterSignInUrl || '',
    afterSignUpUrl: authenticateContext.afterSignUpUrl || '',
    isSignedIn: false,
    isAuthenticated: false,
    tokenType: 'session_token',
    toAuth: () => null,
    headers,
    token: null,
  });
}

const withDebugHeaders = <T extends { headers: Headers; message?: string; reason?: AuthReason; status?: AuthStatus }>(
  requestState: T,
): T => {
  const headers = new Headers(requestState.headers || {});

  if (requestState.message) {
    try {
      headers.set(constants.Headers.AuthMessage, requestState.message);
    } catch {
      // headers.set can throw if unicode strings are passed to it. In this case, simply do nothing
    }
  }

  if (requestState.reason) {
    try {
      headers.set(constants.Headers.AuthReason, requestState.reason);
    } catch {
      /* empty */
    }
  }

  if (requestState.status) {
    try {
      headers.set(constants.Headers.AuthStatus, requestState.status);
    } catch {
      /* empty */
    }
  }

  requestState.headers = headers;

  return requestState;
};
