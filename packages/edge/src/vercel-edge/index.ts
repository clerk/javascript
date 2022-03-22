import { AuthStatus, Base, createGetToken, createSignedOutState } from '@clerk/backend-core';
import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';

import { ClerkAPI } from './ClerkAPI';
import {
  NextMiddlewareResult,
  WithEdgeMiddlewareAuthCallback,
  WithEdgeMiddlewareAuthMiddlewareResult,
  WithEdgeMiddlewareAuthOptions,
} from './types';
import { injectAuthIntoRequest } from './utils';

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
const sessions = ClerkAPI.sessions;
const smsMessages = ClerkAPI.smsMessages;
const users = ClerkAPI.users;

// Export sub-api objects
export { allowlistIdentifiers, clients, emails, invitations, sessions, smsMessages, users };

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
  },
): any {
  return async function clerkAuth(req: NextRequest, event: NextFetchEvent) {
    const { loadUser, loadSession, jwtKey, authorizedParties } = options;
    const cookieToken = req.cookies['__session'];
    const headerToken = req.headers.get('authorization');
    const { status, interstitial, sessionClaims } = await vercelEdgeBase.getAuthState({
      cookieToken,
      headerToken,
      clientUat: req.cookies['__client_uat'],
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
      return new NextResponse(interstitial, {
        headers: { 'Content-Type': 'text/html' },
        status: 401,
      });
    }

    /* In both SignedIn and SignedOut states, we just add the attributes to the request object and passthrough. */
    if (status === AuthStatus.SignedOut) {
      return handler(injectAuthIntoRequest(req, createSignedOutState()), event);
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

    const authRequest = injectAuthIntoRequest(req, { user, session, sessionId, userId, getToken });
    return handler(authRequest, event);
  };
}
