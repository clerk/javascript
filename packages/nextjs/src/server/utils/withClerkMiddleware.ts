import { AuthStatus } from '@clerk/backend-core';
import { vercelEdgeBase } from '@clerk/edge';
import { NextMiddleware, NextMiddlewareResult } from 'next/dist/server/web/types';
import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';

import {
  AUTH_RESULT,
  AuthResult,
  NEXT_REDIRECT_HEADER,
  NEXT_RESUME_HEADER,
  NEXT_REWRITE_HEADER,
  SESSION_COOKIE_NAME,
} from '../types';
import { getAuthResultFromRequest, setPrivateAuthResultOnRequest } from './requestResponseUtils';

const DEFAULT_API_URL = process.env.CLERK_API_URL || 'https://api.clerk.dev';
const DEFAULT_API_VERSION = process.env.CLERK_API_VERSION || 'v1';

// Using public interstitial endpoint for time being
const INTERSTITIAL_URL = `${DEFAULT_API_URL}/${DEFAULT_API_VERSION}/public/interstitial?frontendApi=${process.env.NEXT_PUBLIC_CLERK_FRONTEND_API}`;

type WithAuthOptions = {
  jwtKey?: string;
  authorizedParties?: string[];
};

interface WithClerkMiddleware {
  (handler: NextMiddleware, opts?: WithAuthOptions): NextMiddleware;

  (): NextMiddleware;
}

export const withClerkMiddleware: WithClerkMiddleware = (...args: unknown[]) => {
  const noop = () => undefined;
  const [handler = noop, opts = {}] = args as [NextMiddleware, WithAuthOptions] | [];

  return async (req: NextRequest, event: NextFetchEvent) => {
    const { headers, cookies } = req;
    const { jwtKey, authorizedParties } = opts;

    // throw an error if the request already includes an auth result, because that means it has been spoofed
    if (getAuthResultFromRequest(req)) {
      throw new Error('withClerkMiddleware: Auth violation detected');
    }

    // get auth state, check if we need to return an interstitial
    const cookieToken = cookies.get(SESSION_COOKIE_NAME);
    const headerToken = headers.get('authorization')?.replace('Bearer ', '');

    const { status, errorReason } = await vercelEdgeBase.getAuthState({
      cookieToken,
      headerToken,
      clientUat: cookies.get('__client_uat'),
      origin: headers.get('origin'),
      host: headers.get('host') as string,
      forwardedPort: headers.get('x-forwarded-port'),
      forwardedHost: headers.get('x-forwarded-host'),
      referrer: headers.get('referer'),
      userAgent: headers.get('user-agent'),
      fetchInterstitial: () => null, // not applicable since middleware can't render a response itself
      jwtKey,
      authorizedParties,
    });

    // Interstitial case
    // Note: there is currently no way to rewrite to a protected endpoint
    // Therefore we have to resort to a public interstitial endpoint

    if (status === AuthStatus.Interstitial) {
      const response = NextResponse.rewrite(INTERSTITIAL_URL);
      response.headers.set(AUTH_RESULT, errorReason as string);
      return response;
    }

    // Signed in / out case

    const authResult = status === AuthStatus.SignedIn ? AuthResult.StandardSignedIn : errorReason;

    if (!authResult) {
      throw new Error('withClerkMiddleware: Auth result could not be determined');
    }

    // Set auth result on request in a private property so that middleware can read it too
    setPrivateAuthResultOnRequest({ req, authResult });

    // get result from provided handler
    const res = await handler(req, event);

    return handleMiddlewareResult({ req, res, authResult });
  };
};

type HandleMiddlewareResultProps = {
  req: NextRequest;
  res: NextMiddlewareResult;
  authResult: string;
};

// Auth result will be set as both a query param & header when applicable
export function handleMiddlewareResult({ req, res, authResult }: HandleMiddlewareResultProps): NextMiddlewareResult {
  // pass-through case, convert to next()
  if (!res) {
    res = NextResponse.next();
  }

  // redirect() case, return early
  if (res.headers.get(NEXT_REDIRECT_HEADER)) {
    return res;
  }

  let rewriteURL;

  // next() case, convert to a rewrite
  if (res.headers.get(NEXT_RESUME_HEADER) === '1') {
    res.headers.delete(NEXT_RESUME_HEADER);
    rewriteURL = new URL(req.url);
  }

  // rewrite() case, set auth result only if origin remains the same
  const rewriteURLHeader = res.headers.get(NEXT_REWRITE_HEADER);

  if (rewriteURLHeader) {
    const reqURL = new URL(req.url);
    rewriteURL = new URL(rewriteURLHeader);

    // if the origin has changed, return early
    if (rewriteURL.origin !== reqURL.origin) {
      return res;
    }
  }

  if (rewriteURL) {
    res.headers.set(AUTH_RESULT, authResult);
    rewriteURL.searchParams.set(AUTH_RESULT, authResult);
    res.headers.set(NEXT_REWRITE_HEADER, rewriteURL.href);
  }

  return res;
}
