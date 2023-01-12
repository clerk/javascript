import type { JwtPayload } from '@clerk/types';
import type { SignedInAuthObject, SignedOutAuthObject } from './authObjects';
import { TokenVerificationErrorReason } from './errors';

import { createBackendApiClient } from '../api';
import { signedInAuthObject, signedOutAuthObject } from './authObjects';

export enum AuthStatus {
  SignedIn = 'signed-in',
  SignedOut = 'signed-out',
  Interstitial = 'interstitial',
}

export type SignedInState = {
  status: AuthStatus.SignedIn;
  reason: null;
  message: null;
  frontendApi: string;
  publishableKey: string;
  isSignedIn: true;
  isInterstitial: false;
  toAuth: () => SignedInAuthObject;
};

export type SignedOutState = {
  status: AuthStatus.SignedOut;
  message: string;
  reason: AuthReason;
  frontendApi: string;
  publishableKey: string;
  isSignedIn: false;
  isInterstitial: false;
  toAuth: () => SignedOutAuthObject;
};

export type InterstitialState = Omit<SignedOutState, 'isInterstitial' | 'status' | 'toAuth'> & {
  status: AuthStatus.Interstitial;
  isSignedIn: false;
  isInterstitial: true;
  reason: AuthReason;
  toAuth: () => null;
};

export enum AuthErrorReason {
  HeaderMissingNonBrowser = 'header-missing-non-browser',
  HeaderMissingCORS = 'header-missing-cors',
  CookieUATMissing = 'uat-missing',
  CrossOriginReferrer = 'cross-origin-referrer',
  CookieAndUATMissing = 'cookie-and-uat-missing',
  StandardSignedIn = 'standard-signed-in',
  StandardSignedOut = 'standard-signed-out',
  CookieMissing = 'cookie-missing',
  CookieOutDated = 'cookie-outdated',
  UnexpectedError = 'unexpected-error',
  Unknown = 'unknown',
}

export type AuthReason = AuthErrorReason | TokenVerificationErrorReason;

export type RequestState = SignedInState | SignedOutState | InterstitialState;

export async function signedIn<T>(options: T, sessionClaims: JwtPayload): Promise<SignedInState> {
  const {
    apiKey,
    secretKey,
    apiUrl,
    apiVersion,
    cookieToken,
    frontendApi,
    publishableKey,
    headerToken,
    loadSession,
    loadUser,
    loadOrganization,
  } = options as any;

  const { sid: sessionId, org_id: orgId, sub: userId } = sessionClaims;

  const { sessions, users, organizations } = createBackendApiClient({
    apiKey,
    secretKey,
    apiUrl,
    apiVersion,
  });

  const [sessionResp, userResp, organizationResp] = await Promise.all([
    loadSession ? sessions.getSession(sessionId) : Promise.resolve(undefined),
    loadUser ? users.getUser(userId) : Promise.resolve(undefined),
    loadOrganization && orgId ? organizations.getOrganization({ organizationId: orgId }) : Promise.resolve(undefined),
  ]);

  const session = sessionResp;
  const user = userResp;
  const organization = organizationResp;
  // const session = sessionResp && !sessionResp.errors ? sessionResp.data : undefined;
  // const user = userResp && !userResp.errors ? userResp.data : undefined;
  // const organization = organizationResp && !organizationResp.errors ? organizationResp.data : undefined;

  const authObject = signedInAuthObject(
    sessionClaims,
    {
      apiKey,
      apiUrl,
      apiVersion,
      token: cookieToken || headerToken || '',
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
    frontendApi,
    publishableKey,
    isSignedIn: true,
    isInterstitial: false,
    toAuth: () => authObject,
  };
}

export function signedOut<T>(options: T, reason: AuthReason, message = ''): SignedOutState {
  const { frontendApi, publishableKey } = options as any;

  return {
    status: AuthStatus.SignedOut,
    reason,
    message,
    frontendApi,
    publishableKey,
    isSignedIn: false,
    isInterstitial: false,
    toAuth: () => signedOutAuthObject({ ...options, status: AuthStatus.SignedOut, reason, message }),
  };
}

export function interstitial<T>(options: T, reason: AuthReason, message = ''): InterstitialState {
  const { frontendApi, publishableKey } = options as any;
  return {
    status: AuthStatus.Interstitial,
    reason,
    message,
    frontendApi: frontendApi,
    publishableKey: publishableKey,
    isSignedIn: false,
    isInterstitial: true,
    toAuth: () => null,
  };
}
