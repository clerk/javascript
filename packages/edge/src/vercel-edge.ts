import type { JWTPayload } from '@clerk/backend-core';
import {
  AuthStatus,
  Base,
  ClerkBackendAPI,
  Session,
} from '@clerk/backend-core';
import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';

import { PACKAGE_REPO } from './constants';
import { LIB_NAME, LIB_VERSION } from './info';

type Middleware = (
  req: NextRequest,
  event: NextFetchEvent,
) => Response | void | Promise<Response | void>;

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

export const ClerkAPI = new ClerkBackendAPI({
  libName: LIB_NAME,
  libVersion: LIB_VERSION,
  packageRepo: PACKAGE_REPO,
  fetcher: (url, { method, authorization, contentType, userAgent, body }) => {
    return fetch(url, {
      method,
      headers: {
        authorization: authorization,
        'Content-Type': contentType,
        'User-Agent': userAgent,
        'X-Clerk-SDK': `vercel-edge/${LIB_VERSION}`,
      },
      ...(body && { body: JSON.stringify(body) }),
    }).then(body => body.json());
  },
});

async function fetchInterstitial() {
  const response = await ClerkAPI.fetchInterstitial<Response>();
  return response.text();
}

/** Export middleware wrapper */

export type NextRequestWithAuth = NextRequest & {
  session?: Session;
  sessionClaims?: JWTPayload;
};

export type MiddlewareOptions = {
  authorizedParties?: string[];
};

export function withAuth(
  handler: Middleware,
  { authorizedParties }: MiddlewareOptions = { authorizedParties: [] },
) {
  return async function clerkAuth(req: NextRequest, event: NextFetchEvent) {
    const { status, session, interstitial, sessionClaims } =
      await vercelEdgeBase.getAuthState({
        cookieToken: req.cookies['__session'],
        clientUat: req.cookies['__client_uat'],
        headerToken: req.headers.get('authorization'),
        origin: req.headers.get('origin'),
        host: req.headers.get('host') as string,
        forwardedPort: req.headers.get('x-forwarded-port'),
        forwardedHost: req.headers.get('x-forwarded-host'),
        referrer: req.headers.get('referrer'),
        authorizedParties: authorizedParties,
        fetchInterstitial,
      });

    if (status === AuthStatus.SignedOut) {
      return handler(req, event);
    }

    if (status === AuthStatus.Interstitial) {
      return new NextResponse(interstitial, {
        headers: { 'Content-Type': 'text/html' },
        status: 401,
      });
    }

    if (status === AuthStatus.SignedIn) {
      // @ts-ignore
      req.session = session;
      // @ts-ignore
      req.sessionClaims = sessionClaims;
      return handler(req, event);
    }
  };
}
