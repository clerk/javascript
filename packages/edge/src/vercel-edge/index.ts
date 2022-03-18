import { AuthStatus, Base } from '@clerk/backend-core';
import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';

import { ClerkAPI } from './ClerkAPI';
import {
  NextMiddlewareResult,
  WithEdgeMiddlewareAuthCallback,
  WithEdgeMiddlewareAuthMiddlewareResult,
  WithEdgeMiddlewareAuthOptions,
} from './types';
import { injectAuthIntoRequest } from './utils';
import { ServerGetTokenOptions } from '@clerk/types/src';

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

const verifySignature = async (
  algorithm: Algorithm,
  key: CryptoKey,
  signature: Uint8Array,
  data: Uint8Array,
) => {
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
export {
  allowlistIdentifiers,
  clients,
  emails,
  invitations,
  sessions,
  smsMessages,
  users,
};

async function fetchInterstitial() {
  const response = await ClerkAPI.fetchInterstitial<Response>();
  return response.text();
}

/** Export middleware wrapper */

export function withEdgeMiddlewareAuth<
  CallbackReturn extends NextMiddlewareResult,
  Options extends WithEdgeMiddlewareAuthOptions,
>(
  handler: WithEdgeMiddlewareAuthCallback<CallbackReturn, Options>,
  options?: Options,
): WithEdgeMiddlewareAuthMiddlewareResult<CallbackReturn, Options>;

export function withEdgeMiddlewareAuth(
  handler: any,
  options: any = {
    authorizedParties: [],
    loadSession: false,
    loadUser: false,
  },
): any {
  return async function clerkAuth(req: NextRequest, event: NextFetchEvent) {
    /* Get authentication state */
    const { status, interstitial, sessionClaims } =
      await vercelEdgeBase.getAuthState({
        cookieToken: req.cookies['__session'],
        clientUat: req.cookies['__client_uat'],
        headerToken: req.headers.get('authorization'),
        origin: req.headers.get('origin'),
        host: req.headers.get('host') as string,
        userAgent: req.headers.get('user-agent'),
        forwardedPort: req.headers.get('x-forwarded-port'),
        forwardedHost: req.headers.get('x-forwarded-host'),
        referrer: req.headers.get('referrer'),
        authorizedParties: options.authorizedParties,
        fetchInterstitial,
      });

    if (status === AuthStatus.Interstitial) {
      return new NextResponse(interstitial, {
        headers: { 'Content-Type': 'text/html' },
        status: 401,
      });
    }

    const getToken = (options: ServerGetTokenOptions = {}) => {
      if (options.template) {
        throw new Error(
          'Retrieving a JWT template during edge runtime will be supported soon.',
        );
      }
      return Promise.resolve(req.cookies['__session']);
    };

    /* In both SignedIn and SignedOut states, we just add the attributes to the request object and passthrough. */
    if (status === AuthStatus.SignedOut) {
      /* Predetermined signed out attributes */
      const signedOutState = {
        sessionId: null,
        session: null,
        userId: null,
        user: null,
        getToken,
      };
      return handler(injectAuthIntoRequest(req, signedOutState), event);
    }

    const [user, session] = await Promise.all([
      options.loadUser
        ? ClerkAPI.users.getUser(sessionClaims?.sub as string)
        : Promise.resolve(undefined),
      options.loadSession
        ? ClerkAPI.sessions.getSession(sessionClaims?.sid as string)
        : Promise.resolve(undefined),
    ]);

    /* Inject the auth state into the NextResponse object */
    const authRequest = injectAuthIntoRequest(req, {
      user,
      session,
      sessionId: sessionClaims?.sid as string,
      userId: sessionClaims?.sub as string,
      getToken,
    });

    return handler(authRequest, event);
  };
}
