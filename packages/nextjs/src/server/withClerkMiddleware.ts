import type { AuthStatus, OptionalVerifyTokenOptions } from '@clerk/backend';
import { constants } from '@clerk/backend';
import type { NextMiddleware, NextMiddlewareResult } from 'next/dist/server/web/types';
import type { NextFetchEvent, NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { constants as nextConstants } from '../constants';
import { API_KEY, API_URL, clerkClient, FRONTEND_API, PROXY_URL, PUBLISHABLE_KEY, SECRET_KEY } from './clerk';
import {
  getCookie,
  nextJsVersionCanOverrideRequestHeaders,
  setAuthStatusOnRequest,
  setRequestHeadersOnNextResponse,
} from './utils';

type WithAuthOptions = OptionalVerifyTokenOptions;

interface WithClerkMiddleware {
  (handler: NextMiddleware, opts?: WithAuthOptions): NextMiddleware;

  (): NextMiddleware;
}

export const withClerkMiddleware: WithClerkMiddleware = (...args: unknown[]) => {
  const noop = () => undefined;
  const [handler = noop, opts = {}] = args as [NextMiddleware, WithAuthOptions] | [];

  return async (req: NextRequest, event: NextFetchEvent) => {
    const { headers } = req;

    // get auth state, check if we need to return an interstitial
    const cookieToken = getCookie(req, constants.Cookies.Session);
    const headerToken = headers.get('authorization')?.replace('Bearer ', '');

    const requestState = await clerkClient.authenticateRequest({
      ...opts,
      apiKey: API_KEY,
      secretKey: SECRET_KEY,
      frontendApi: FRONTEND_API,
      publishableKey: PUBLISHABLE_KEY,
      cookieToken,
      headerToken,
      clientUat: getCookie(req, '__client_uat'),
      origin: headers.get('origin') || undefined,
      host: headers.get('host') as string,
      forwardedPort: headers.get('x-forwarded-port') || undefined,
      forwardedHost: headers.get('x-forwarded-host') || undefined,
      referrer: headers.get('referer') || undefined,
      userAgent: headers.get('user-agent') || undefined,
      proxyUrl: PROXY_URL,
    });

    // Interstitial case
    // Note: there is currently no way to rewrite to a protected endpoint
    // Therefore we have to resort to a public interstitial endpoint
    if (requestState.isInterstitial || requestState.isUnknown) {
      const response = NextResponse.rewrite(
        clerkClient.remotePublicInterstitialUrl({
          apiUrl: API_URL,
          frontendApi: FRONTEND_API,
          publishableKey: PUBLISHABLE_KEY,
        }),
        { status: 401 },
      );
      response.headers.set(constants.Headers.AuthReason, requestState.reason);
      response.headers.set(constants.Headers.AuthMessage, requestState.message);
      return response;
    }

    // Set auth result on request in a private property so that middleware can read it too
    setAuthStatusOnRequest(req, requestState.status);

    // get result from provided handler
    const res = await handler(req, event);

    return handleMiddlewareResult({ req, res, authStatus: requestState.status });
  };
};

type HandleMiddlewareResultProps = {
  req: NextRequest;
  res: NextMiddlewareResult;
  authStatus: AuthStatus;
};

// Auth result will be set as both a query param & header when applicable
export function handleMiddlewareResult({ req, res, authStatus }: HandleMiddlewareResultProps): NextMiddlewareResult {
  // pass-through case, convert to next()
  if (!res) {
    res = NextResponse.next();
  }

  // redirect() case, return early
  if (res.headers.get(nextConstants.Headers.NextRedirect)) {
    return res;
  }

  let rewriteURL;

  // next() case, convert to a rewrite
  if (res.headers.get(nextConstants.Headers.NextResume) === '1') {
    res.headers.delete(nextConstants.Headers.NextResume);
    rewriteURL = new URL(req.url);
  }

  // rewrite() case, set auth result only if origin remains the same
  const rewriteURLHeader = res.headers.get(nextConstants.Headers.NextRewrite);

  if (rewriteURLHeader) {
    const reqURL = new URL(req.url);
    rewriteURL = new URL(rewriteURLHeader);

    // if the origin has changed, return early
    if (rewriteURL.origin !== reqURL.origin) {
      return res;
    }
  }

  if (rewriteURL) {
    if (nextJsVersionCanOverrideRequestHeaders()) {
      // If we detect that the host app is using a nextjs installation that reliably sets the
      // request headers, we don't need to fall back to the searchParams strategy.
      // In this case, we won't set them at all in order to avoid having them visible in the req.url
      setRequestHeadersOnNextResponse(res, req, { [constants.Headers.AuthStatus]: authStatus });
    } else {
      res.headers.set(constants.Headers.AuthStatus, authStatus);
      rewriteURL.searchParams.set(constants.SearchParams.AuthStatus, authStatus);
    }
    res.headers.set(nextConstants.Headers.NextRewrite, rewriteURL.href);
  }

  return res;
}
