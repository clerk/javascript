import type { JwtPayload, PendingSessionOptions } from '@clerk/shared/types';

import { constants } from '../constants';
import type { TokenVerificationErrorReason } from '../errors';
import type { AuthenticateContext } from './authenticateContext';
import type {
  AuthenticatedMachineObject,
  InvalidTokenAuthObject,
  SignedInAuthObject,
  SignedOutAuthObject,
  UnauthenticatedMachineObject,
} from './authObjects';
import {
  authenticatedMachineObject,
  invalidTokenAuthObject,
  signedInAuthObject,
  signedOutAuthObject,
  unauthenticatedMachineObject,
} from './authObjects';
import type { MachineTokenType, SessionTokenType } from './tokenTypes';
import { TokenType } from './tokenTypes';
import type { MachineAuthType } from './types';

export const AuthStatus = {
  SignedIn: 'signed-in',
  SignedOut: 'signed-out',
  Handshake: 'handshake',
} as const;

export type AuthStatus = (typeof AuthStatus)[keyof typeof AuthStatus];

type ToAuth<T extends TokenType | null, Authenticated extends boolean> = T extends null
  ? () => InvalidTokenAuthObject
  : T extends SessionTokenType
    ? Authenticated extends true
      ? (opts?: PendingSessionOptions) => SignedInAuthObject
      : () => SignedOutAuthObject
    : Authenticated extends true
      ? () => AuthenticatedMachineObject<Exclude<T, SessionTokenType | null>>
      : () => UnauthenticatedMachineObject<Exclude<T, SessionTokenType | null>>;

export type AuthenticatedState<T extends TokenType = SessionTokenType> = {
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
  toAuth: ToAuth<T, true>;
};

export type UnauthenticatedState<T extends TokenType | null = SessionTokenType> = {
  status: typeof AuthStatus.SignedOut;
  reason: AuthReason;
  message: string;
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
  tokenType: T;
  headers: Headers;
  token: null;
  toAuth: ToAuth<T, false>;
};

export type HandshakeState = Omit<UnauthenticatedState<SessionTokenType>, 'status' | 'toAuth' | 'tokenType'> & {
  tokenType: SessionTokenType;
  status: typeof AuthStatus.Handshake;
  headers: Headers;
  toAuth: () => null;
};

/**
 * @deprecated Use AuthenticatedState instead
 */
export type SignedInState = AuthenticatedState<SessionTokenType>;

/**
 * @deprecated Use UnauthenticatedState instead
 */
export type SignedOutState = UnauthenticatedState<SessionTokenType>;

export const AuthErrorReason = {
  ClientUATWithoutSessionToken: 'client-uat-but-no-session-token',
  DevBrowserMissing: 'dev-browser-missing',
  DevBrowserSync: 'dev-browser-sync',
  PrimaryRespondsToSyncing: 'primary-responds-to-syncing',
  PrimaryDomainCrossOriginSync: 'primary-domain-cross-origin-sync',
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

export type RequestState<T extends TokenType | null = SessionTokenType> =
  | AuthenticatedState<T extends null ? never : T>
  | UnauthenticatedState<T>
  | (T extends SessionTokenType ? HandshakeState : never);

type BaseSignedInParams = {
  authenticateContext: AuthenticateContext;
  headers?: Headers;
  token: string;
  tokenType: TokenType;
};

type SignedInParams =
  | (BaseSignedInParams & { tokenType: SessionTokenType; sessionClaims: JwtPayload })
  | (BaseSignedInParams & { tokenType: MachineTokenType; machineData: MachineAuthType });

export function signedIn<T extends TokenType>(params: SignedInParams & { tokenType: T }): AuthenticatedState<T> {
  const { authenticateContext, headers = new Headers(), token } = params;

  const toAuth = (({ treatPendingAsSignedOut = true } = {}) => {
    if (params.tokenType === TokenType.SessionToken) {
      const { sessionClaims } = params as { sessionClaims: JwtPayload };
      const authObject = signedInAuthObject(authenticateContext, token, sessionClaims);

      if (treatPendingAsSignedOut && authObject.sessionStatus === 'pending') {
        return signedOutAuthObject(undefined, authObject.sessionStatus);
      }

      return authObject;
    }

    const { machineData } = params as { machineData: MachineAuthType };
    return authenticatedMachineObject(params.tokenType, token, machineData, authenticateContext);
  }) as ToAuth<T, true>;

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
  };
}

type SignedOutParams = Omit<BaseSignedInParams, 'token'> & {
  reason: AuthReason;
  message?: string;
};

export function signedOut<T extends TokenType>(params: SignedOutParams & { tokenType: T }): UnauthenticatedState<T> {
  const { authenticateContext, headers = new Headers(), reason, message = '', tokenType } = params;

  const toAuth = (() => {
    if (tokenType === TokenType.SessionToken) {
      return signedOutAuthObject({ ...authenticateContext, status: AuthStatus.SignedOut, reason, message });
    }

    return unauthenticatedMachineObject(tokenType, { reason, message, headers });
  }) as ToAuth<T, false>;

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
  });
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
    tokenType: TokenType.SessionToken,
    toAuth: () => null,
    headers,
    token: null,
  });
}

export function signedOutInvalidToken(): UnauthenticatedState<null> {
  const authObject = invalidTokenAuthObject();
  return withDebugHeaders({
    status: AuthStatus.SignedOut,
    reason: AuthErrorReason.TokenTypeMismatch,
    message: '',
    proxyUrl: '',
    publishableKey: '',
    isSatellite: false,
    domain: '',
    signInUrl: '',
    signUpUrl: '',
    afterSignInUrl: '',
    afterSignUpUrl: '',
    isSignedIn: false,
    isAuthenticated: false,
    tokenType: null,
    toAuth: () => authObject,
    headers: new Headers(),
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
