import type { JwtPayload } from '@clerk/types';

import { createBackendApiClient } from '../api';
import type { TokenVerificationErrorReason } from '../errors';
import type { SignedInAuthObject, SignedInAuthObjectOptions, SignedOutAuthObject } from './authObjects';
import { signedInAuthObject, signedOutAuthObject } from './authObjects';

export enum AuthStatus {
  SignedIn = 'signed-in',
  SignedOut = 'signed-out',
  Handshake = 'handshake',
  SessionTokenOutdated = 'SessionTokenOutdated',
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

export type RequestState = SignedInState | SignedOutState | HandshakeState;

type LoadResourcesOptions = {
  loadSession?: boolean;
  loadUser?: boolean;
  loadOrganization?: boolean;
};

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

export type AuthStatusOptionsType = LoadResourcesOptions &
  Partial<SignedInAuthObjectOptions> &
  RequestStateParams &
  AuthParams;

export async function signedIn<T extends AuthStatusOptionsType>(
  options: T,
  sessionClaims: JwtPayload,
  headers: Headers = new Headers(),
): Promise<SignedInState> {
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
    loadSession,
    loadUser,
    loadOrganization,
  } = options;

  const { sid: sessionId, org_id: orgId, sub: userId } = sessionClaims;

  const { sessions, users, organizations } = createBackendApiClient({
    secretKey,
    apiUrl,
    apiVersion,
  });

  const [sessionResp, userResp, organizationResp] = await Promise.all([
    loadSession ? sessions.getSession(sessionId) : Promise.resolve(undefined),
    loadUser ? users.getUser(userId) : Promise.resolve(undefined),
    loadOrganization && orgId ? organizations.getOrganization({ organizationId: orgId }) : Promise.resolve(undefined),
  ]);

  const session = sessionResp && !sessionResp.errors ? sessionResp.data : undefined;
  const user = userResp && !userResp.errors ? userResp.data : undefined;
  const organization = organizationResp && !organizationResp.errors ? organizationResp.data : undefined;

  const authObject = signedInAuthObject(
    sessionClaims,
    {
      secretKey,
      apiUrl,
      apiVersion,
      token: sessionTokenInCookie || sessionTokenInHeader || '',
      session,
      user,
      organization,
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
