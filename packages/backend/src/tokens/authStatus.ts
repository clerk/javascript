import type { JwtPayload } from '@clerk/types';

import type { TokenVerificationErrorReason } from '../errors';
import type { SignedInAuthObject, SignedInAuthObjectOptions, SignedOutAuthObject } from './authObjects';
import { signedInAuthObject, signedOutAuthObject } from './authObjects';

/**
 * @internal
 */
export enum AuthStatus {
  SignedIn = 'signed-in',
  SignedOut = 'signed-out',
  Handshake = 'handshake',
}

export type SignedInState = {
  status: AuthStatus.SignedIn;
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
};

export type SignedOutState = {
  status: AuthStatus.SignedOut;
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
};

export type HandshakeState = Omit<SignedOutState, 'status' | 'toAuth'> & {
  status: AuthStatus.Handshake;
  headers: Headers;
  toAuth: () => null;
};

export enum AuthErrorReason {
  ClientUATWithoutSessionToken = 'client-uat-but-no-session-token',
  DevBrowserSync = 'dev-browser-sync',
  PrimaryRespondsToSyncing = 'primary-responds-to-syncing',
  SatelliteCookieNeedsSyncing = 'satellite-needs-syncing',
  SessionTokenAndUATMissing = 'session-token-and-uat-missing',
  SessionTokenMissing = 'session-token-missing',
  SessionTokenOutdated = 'session-token-outdated',
  SessionTokenWithoutClientUAT = 'session-token-but-no-client-uat',
  UnexpectedError = 'unexpected-error',
}

export type AuthReason = AuthErrorReason | TokenVerificationErrorReason;

/**
 * @internal
 */
export type RequestState = SignedInState | SignedOutState | HandshakeState;

type RequestStateParams = {
  publishableKey?: string;
  domain?: string;
  isSatellite?: boolean;
  proxyUrl?: string;
  signInUrl?: string;
  signUpUrl?: string;
  afterSignInUrl?: string;
  afterSignUpUrl?: string;
};

type AuthParams = {
  /* Session token cookie value */
  sessionTokenInCookie?: string;
  /* Client token header value */
  sessionTokenInHeader?: string;
  /* Client uat cookie value */
  clientUat?: string;
};

export type AuthStatusOptionsType = Partial<SignedInAuthObjectOptions> & RequestStateParams & AuthParams;

export function signedIn<T extends AuthStatusOptionsType>(
  options: T,
  sessionClaims: JwtPayload,
  headers: Headers = new Headers(),
): SignedInState {
  const {
    publishableKey = '',
    proxyUrl = '',
    isSatellite = false,
    domain = '',
    signInUrl = '',
    signUpUrl = '',
    afterSignInUrl = '',
    afterSignUpUrl = '',
    secretKey,
    apiUrl,
    apiVersion,
    sessionTokenInCookie,
    sessionTokenInHeader,
  } = options;

  const authObject = signedInAuthObject(
    sessionClaims,
    {
      secretKey,
      apiUrl,
      apiVersion,
      token: sessionTokenInCookie || sessionTokenInHeader || '',
    },
    { ...options, status: AuthStatus.SignedIn },
  );

  return {
    status: AuthStatus.SignedIn,
    reason: null,
    message: null,
    proxyUrl,
    publishableKey,
    domain,
    isSatellite,
    signInUrl,
    signUpUrl,
    afterSignInUrl,
    afterSignUpUrl,
    isSignedIn: true,
    toAuth: () => authObject,
    headers,
  };
}
export function signedOut<T extends AuthStatusOptionsType>(
  options: T,
  reason: AuthReason,
  message = '',
  headers: Headers = new Headers(),
): SignedOutState {
  const {
    publishableKey = '',
    proxyUrl = '',
    isSatellite = false,
    domain = '',
    signInUrl = '',
    signUpUrl = '',
    afterSignInUrl = '',
    afterSignUpUrl = '',
  } = options;

  return {
    status: AuthStatus.SignedOut,
    reason,
    message,
    proxyUrl,
    publishableKey,
    isSatellite,
    domain,
    signInUrl,
    signUpUrl,
    afterSignInUrl,
    afterSignUpUrl,
    isSignedIn: false,
    headers,
    toAuth: () => signedOutAuthObject({ ...options, status: AuthStatus.SignedOut, reason, message }),
  };
}

export function handshake<T extends AuthStatusOptionsType>(
  options: T,
  reason: AuthReason,
  message = '',
  headers: Headers,
): HandshakeState {
  const {
    publishableKey = '',
    proxyUrl = '',
    isSatellite = false,
    domain = '',
    signInUrl = '',
    signUpUrl = '',
    afterSignInUrl = '',
    afterSignUpUrl = '',
  } = options;

  return {
    status: AuthStatus.Handshake,
    reason,
    message,
    publishableKey,
    isSatellite,
    domain,
    proxyUrl,
    signInUrl,
    signUpUrl,
    afterSignInUrl,
    afterSignUpUrl,
    isSignedIn: false,
    headers,
    toAuth: () => null,
  };
}
