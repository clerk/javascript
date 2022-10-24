import type { ClerkJWTClaims } from '@clerk/types';
import { verify } from 'node:crypto';

import { isDevelopmentFromApiKey, isProductionFromApiKey } from '../util/instance';
import { checkCrossOrigin } from '../util/request';
import { AuthErrorReason } from './errors';
import { type VerifyTokenOptions, verifyToken } from './verify';

export type GetAuthStateOptions = {
  /* Clerk Backend API key value */
  apiKey: string;
  /* Client token cookie value */
  cookieToken?: string;
  /* Client uat cookie value */
  clientUat?: string;
  /* Client token header value */
  headerToken?: string | null;
  /* Request origin header value */
  origin?: string | null;
  /* Request host header value */
  host: string;
  /* Request forwarded host value */
  forwardedHost?: string | null;
  /* Request forwarded port value */
  forwardedPort?: string | null;
  /* Request forwarded proto value */
  forwardedProto?: string | null;
  /* Request referrer */
  referrer?: string | null;
  /* Request user-agent value */
  userAgent?: string | null;
  /* A list of authorized parties to validate against the session token azp claim */
  authorizedParties?: string[];
  /* Value corresponding to the JWT verification key */
  key?: string;
  /* A function that returns the HTML of the interstitial */
  interstitial: () => Promise<string>;
} & VerifyTokenOptions;

export enum AuthStatus {
  SignedIn = 'Signed in',
  SignedOut = 'Signed out',
  Interstitial = 'Interstitial',
}

export type AuthState = {
  status: AuthStatus;
  /* Interstitial is returned as null when the interstitial endpoint will be rewritten to instead of being rendered directly */
  interstitial?: string | null;
  sessionClaims?: ClerkJWTClaims;
  errorReason?: AuthErrorReason;
};

/**
 *
 * Retrieve the authentication state for a request by using client specific information.
 *
 * @throws {Error} Token expired, Wrong azp, Malformed token. All of these cases should result in signed out state.
 *
 * @param {AuthStateParams}
 * @returns {Promise<AuthState>}
 */

export async function getAuthState({
  apiKey,
  authorizedParties,
  clientUat,
  clockSkewInSeconds,
  cookieToken,
  forwardedHost,
  forwardedPort,
  forwardedProto,
  headerToken,
  host,
  interstitial,
  jwksTtlInMs,
  origin,
  referrer,
  userAgent,
}: GetAuthStateOptions): Promise<AuthState> {
  if (headerToken) {
    const sessionClaims = await verifyToken(headerToken, {
      authorizedParties,
      clockSkewInSeconds,
      jwksTtlInMs,
      issuer: iss => iss.startsWith('https://clerk.'),
    });

    return {
      sessionClaims,
      status: AuthStatus.SignedIn,
    };
  }

  if (!apiKey) {
    // TODO: Throw a SessionVerifierError
    throw new Error('Missing Backend API Key...');
  }

  const isProductionInstance = isProductionFromApiKey(apiKey);
  const isDevelopmentInstance = isDevelopmentFromApiKey(apiKey);

  // In development or staging environments only, based on the request's
  // User Agent, detect non-browser requests (e.g. scripts). If there
  // is no Authorization header, consider the user as signed out and
  // prevent interstitial rendering
  if (isDevelopmentInstance && !userAgent?.startsWith('Mozilla/')) {
    return { status: AuthStatus.SignedOut, errorReason: AuthErrorReason.HeaderMissingNonBrowser };
  }

  // In cross-origin requests the use of Authorization header is mandatory
  if (
    origin &&
    checkCrossOrigin({
      originURL: new URL(origin),
      host,
      forwardedHost,
      forwardedPort,
      forwardedProto,
    })
  ) {
    return { status: AuthStatus.SignedOut, errorReason: AuthErrorReason.HeaderMissingCORS };
  }

  // First load of development. Could be logged in on Clerk-hosted UI.
  if (isDevelopmentInstance && !clientUat) {
    return {
      status: AuthStatus.Interstitial,
      interstitial: await interstitial(),
      errorReason: AuthErrorReason.UATMissing,
    };
  }

  // Potentially arriving after a sign-in or sign-out on Clerk-hosted UI.
  if (
    isProductionInstance &&
    referrer &&
    checkCrossOrigin({
      originURL: new URL(referrer),
      host,
      forwardedHost,
      forwardedPort,
      forwardedProto,
    })
  ) {
    return {
      status: AuthStatus.Interstitial,
      interstitial: await interstitial(),
      errorReason: AuthErrorReason.CrossOriginReferrer,
    };
  }

  // Probably first load for production
  if (isProductionInstance && !clientUat && !cookieToken) {
    return { status: AuthStatus.SignedOut, errorReason: AuthErrorReason.CookieAndUATMissing };
  }

  if (clientUat === '0') {
    return { status: AuthStatus.SignedOut, errorReason: AuthErrorReason.StandardSignedOut };
  }

  if (isProductionInstance && clientUat && !cookieToken) {
    return {
      status: AuthStatus.Interstitial,
      interstitial: await interstitial(),
      errorReason: AuthErrorReason.CookieMissing,
    };
  }

  const sessionClaims = await verifyToken(cookieToken!, {
    authorizedParties,
    clockSkewInSeconds,
    jwksTtlInMs,
    issuer: iss => iss.startsWith('https://clerk.'),
  });

  if (sessionClaims && sessionClaims.iat >= Number(clientUat)) {
    return {
      status: AuthStatus.SignedIn,
      sessionClaims,
    };
  }

  if (sessionClaims && sessionClaims.iat < Number(clientUat)) {
    return {
      status: AuthStatus.Interstitial,
      interstitial: await interstitial(),
      errorReason: AuthErrorReason.CookieOutDated,
    };
  }

  return {
    status: AuthStatus.Interstitial,
    interstitial: await interstitial(),
    errorReason: AuthErrorReason.Unknown,
  };
}
