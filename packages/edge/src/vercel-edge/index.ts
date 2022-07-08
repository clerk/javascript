import { AuthStatus, Base, createGetToken, createSignedOutState } from '@clerk/backend-core';
import { ClerkJWTClaims } from '@clerk/types';
import { NextFetchEvent, NextRequest } from 'next/server';

import { ClerkAPI } from './ClerkAPI';
import {
  NextMiddlewareResult,
  WithEdgeMiddlewareAuthCallback,
  WithEdgeMiddlewareAuthMiddlewareResult,
  WithEdgeMiddlewareAuthOptions,
} from './types';
import { injectAuthIntoRequest } from './utils';
import { interstitialResponse, signedOutResponse } from './utils/responses';

/**
 *
 * Required implementations for the runtime:
 * 1. Import Key
 * 2. Verify Signature
 * 3. Decode Base64
 * 4. ClerkAPI export with fetcher implementation
 * 5. Fetch Interstitial
 *
 */

const importKey = async (jwk: JsonWebKey, algorithm: Algorithm) => {
  return await crypto.subtle.importKey('jwk', jwk, algorithm, true, ['verify']);
};

const verifySignature = async (algorithm: Algorithm, key: CryptoKey, signature: Uint8Array, data: Uint8Array) => {
  return await crypto.subtle.verify(algorithm, key, signature, data);
};

const decodeBase64 = (base64: string) => atob(base64);

/** Base initialization */

const vercelEdgeBase = new Base(importKey, verifySignature, decodeBase64);

/** Export standalone verifySessionToken */

export const verifySessionToken = vercelEdgeBase.verifySessionToken;

/** Export ClerkBackendAPI API client */

const allowlistIdentifiers = ClerkAPI.allowlistIdentifiers;
const clients = ClerkAPI.clients;
const emails = ClerkAPI.emails;
const invitations = ClerkAPI.invitations;
const organizations = ClerkAPI.organizations;
const sessions = ClerkAPI.sessions;
const smsMessages = ClerkAPI.smsMessages;
const users = ClerkAPI.users;

// Export sub-api objects
export { allowlistIdentifiers, clients, emails, invitations, organizations, sessions, smsMessages, users };

async function fetchInterstitial() {
  const response = await ClerkAPI.fetchInterstitial<Response>();
  return response.text();
}

export function withEdgeMiddlewareAuth<
  CallbackReturn extends NextMiddlewareResult | Promise<NextMiddlewareResult>,
  Options extends WithEdgeMiddlewareAuthOptions,
>(
  handler: WithEdgeMiddlewareAuthCallback<CallbackReturn, Options>,
  options?: Options,
): WithEdgeMiddlewareAuthMiddlewareResult<CallbackReturn, Options>;

export function withEdgeMiddlewareAuth(
  handler: any,
  options: any = {
    loadSession: false,
    loadUser: false,
    strict: false,
  },
): any {
  return vercelMiddlewareAuth(handler, { strict: false, ...options });
}

export function requireEdgeMiddlewareAuth(
  handler: any,
  options: any = {
    loadSession: false,
    loadUser: false,
  },
): any {
  return vercelMiddlewareAuth(handler, { strict: true, ...options });
}

function vercelMiddlewareAuth(
  handler: any,
  options: any = {
    loadSession: false,
    loadUser: false,
  },
): any {
  return async function clerkAuth(req: NextRequest, event: NextFetchEvent) {
    const { loadUser, loadSession, jwtKey, authorizedParties } = options;

    const cookieToken = getCookie(req.cookies, '__session');
    const clientUat = getCookie(req.cookies, '__client_uat');

    const headerToken = req.headers.get('authorization');
    const { status, interstitial, sessionClaims, errorReason } = await vercelEdgeBase.getAuthState({
      cookieToken,
      headerToken,
      clientUat,
      origin: req.headers.get('origin'),
      host: req.headers.get('host') as string,
      userAgent: req.headers.get('user-agent'),
      forwardedPort: req.headers.get('x-forwarded-port'),
      forwardedHost: req.headers.get('x-forwarded-host'),
      referrer: req.headers.get('referrer'),
      authorizedParties,
      jwtKey,
      fetchInterstitial,
    });

    if (status === AuthStatus.Interstitial) {
      return interstitialResponse(interstitial as string, errorReason);
    }

    if (status === AuthStatus.SignedOut) {
      if (options.strict) {
        return signedOutResponse(errorReason);
      }

      const response = (await handler(
        injectAuthIntoRequest(req, createSignedOutState()),
        event,
      )) as NextMiddlewareResult;
      response?.headers.set('Auth-Result', errorReason || '');
      return response;
    }

    const sessionId = sessionClaims!.sid;
    const userId = sessionClaims!.sub;

    const [user, session] = await Promise.all([
      loadUser ? ClerkAPI.users.getUser(userId) : Promise.resolve(undefined),
      loadSession ? ClerkAPI.sessions.getSession(sessionId) : Promise.resolve(undefined),
    ]);

    const getToken = createGetToken({
      sessionId,
      cookieToken,
      headerToken: headerToken || '',
      fetcher: (...args) => ClerkAPI.sessions.getToken(...args),
    });

    const authRequest = injectAuthIntoRequest(req, {
      user,
      session,
      sessionId,
      userId,
      getToken,
      claims: sessionClaims as ClerkJWTClaims,
    });
    return handler(authRequest, event);
  };
}

/* As of Next.js 12.2, the req.cookies API is accessed using .get, on previous releases, it used plain object access. To support both without breaking previous versions, we can use this simple check. */
function getCookie(cookies: NextRequest['cookies'], name: string) {
  if (typeof cookies.get === 'function') {
    return cookies.get(name);
  } else {
    // @ts-expect-error
    return cookies[name];
  }
}
