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

export const AuthStatus = {
  SignedIn: 'signed-in',
  SignedOut: 'signed-out',
  Handshake: 'handshake',
  MachineAuthenticated: 'machine-authenticated',
  MachineUnauthenticated: 'machine-unauthenticated',
} as const;

export type AuthStatus = (typeof AuthStatus)[keyof typeof AuthStatus];

export type SignedInState = {
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
  isSignedIn: true;
  toAuth: () => SignedInAuthObject;
  headers: Headers;
  token: string;
};

export type SignedOutState = {
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
  isSignedIn: false;
  toAuth: () => SignedOutAuthObject;
  headers: Headers;
  token: null;
};

export type HandshakeState = Omit<SignedOutState, 'status' | 'toAuth'> & {
  status: typeof AuthStatus.Handshake;
  headers: Headers;
  toAuth: () => null;
};

export type MachineAuthenticatedState = Omit<SignedOutState, 'status' | 'toAuth' | 'token' | 'reason' | 'message'> & {
  status: typeof AuthStatus.MachineAuthenticated;
  reason: null;
  message: null;
  isMachineAuthenticated: true;
  toAuth: () => AuthenticatedMachineObject;
  token: string;
};

export type MachineUnauthenticatedState = Omit<SignedOutState, 'status' | 'toAuth'> & {
  status: typeof AuthStatus.MachineUnauthenticated;
  message: string;
  isMachineAuthenticated: false;
  toAuth: () => UnauthenticatedMachineObject;
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
  UnexpectedError: 'unexpected-error',
} as const;

export type AuthErrorReason = (typeof AuthErrorReason)[keyof typeof AuthErrorReason];

export type AuthReason = AuthErrorReason | TokenVerificationErrorReason;

export type RequestState =
  | SignedInState
  | SignedOutState
  | HandshakeState
  | MachineAuthenticatedState
  | MachineUnauthenticatedState;

export function signedIn(
  authenticateContext: AuthenticateContext,
  sessionClaims: JwtPayload,
  headers: Headers = new Headers(),
  token: string,
): SignedInState {
  const authObject = signedInAuthObject(authenticateContext, token, sessionClaims);
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
    toAuth: () => authObject,
    headers,
    token,
  };
}

export function signedOut(
  authenticateContext: AuthenticateContext,
  reason: AuthReason,
  message = '',
  headers: Headers = new Headers(),
): SignedOutState {
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
    headers,
    toAuth: () => signedOutAuthObject({ ...authenticateContext, status: AuthStatus.SignedOut, reason, message }),
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
    headers,
    toAuth: () => null,
    token: null,
  });
}

export function machineAuthenticated(
  authenticateContext: AuthenticateContext,
  headers: Headers = new Headers(),
  token: string,
  claims: JwtPayload,
): MachineAuthenticatedState {
  const machineAuthObject = authenticatedMachineObject(token, claims);
  return {
    status: AuthStatus.MachineAuthenticated,
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
    isSignedIn: false,
    isMachineAuthenticated: true,
    toAuth: () => machineAuthObject,
    headers,
    token,
  };
}

export function machineUnauthenticated(
  authenticateContext: AuthenticateContext,
  reason: AuthReason,
  message = '',
  headers: Headers = new Headers(),
): MachineUnauthenticatedState {
  return withDebugHeaders({
    status: AuthStatus.MachineUnauthenticated,
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
    isMachineAuthenticated: false,
    toAuth: () => unauthenticatedMachineObject(),
    headers,
    token: null,
  });
}

const withDebugHeaders = <T extends RequestState>(requestState: T): T => {
  const headers = new Headers(requestState.headers || {});

  if (requestState.message) {
    try {
      headers.set(constants.Headers.AuthMessage, requestState.message);
    } catch (e) {
      // headers.set can throw if unicode strings are passed to it. In this case, simply do nothing
    }
  }

  if (requestState.reason) {
    try {
      headers.set(constants.Headers.AuthReason, requestState.reason);
    } catch (e) {
      /* empty */
    }
  }

  if (requestState.status) {
    try {
      headers.set(constants.Headers.AuthStatus, requestState.status);
    } catch (e) {
      /* empty */
    }
  }

  requestState.headers = headers;

  return requestState;
};
