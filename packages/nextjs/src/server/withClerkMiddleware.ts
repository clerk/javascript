import type { AuthStatus, RequestState } from '@clerk/backend';
import { constants, debugRequestState } from '@clerk/backend';
import type { NextMiddleware, NextMiddlewareResult } from 'next/dist/server/web/types';
import type { NextFetchEvent, NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { constants as nextConstants } from '../constants';
import {
  API_KEY,
  API_URL,
  clerkClient,
  DOMAIN,
  FRONTEND_API,
  IS_SATELLITE,
  JS_VERSION,
  PROXY_URL,
  PUBLISHABLE_KEY,
  SECRET_KEY,
  SIGN_IN_URL,
} from './clerk';
import { isDevOrStagingUrl } from './isDevOrStagingUrl';
import { parsePublishableKey } from './parsePublishableKey';
import type { WithAuthOptions } from './types';
import {
  getCookie,
  handleValueOrFn,
  isHttpOrHttps,
  nextJsVersionCanOverrideRequestHeaders,
  setCustomAttributeOnRequest,
  setRequestHeadersOnNextResponse,
} from './utils';

interface WithClerkMiddleware {
  (handler: NextMiddleware, opts?: WithAuthOptions): NextMiddleware;

  (): NextMiddleware;
}

export const decorateResponseWithObservabilityHeaders = (res: NextResponse, requestState: RequestState) => {
  requestState.message && res.headers.set(constants.Headers.AuthMessage, encodeURIComponent(requestState.message));
  requestState.reason && res.headers.set(constants.Headers.AuthReason, encodeURIComponent(requestState.reason));
  requestState.status && res.headers.set(constants.Headers.AuthStatus, encodeURIComponent(requestState.status));
};

export const withClerkMiddleware: WithClerkMiddleware = (...args: unknown[]) => {
  const noop = () => undefined;
  const [handler = noop, opts = {}] = args as [NextMiddleware, WithAuthOptions] | [];

  const proxyUrl = opts?.proxyUrl || PROXY_URL;

  if (!!proxyUrl && !isHttpOrHttps(proxyUrl)) {
    throw new Error(`Only a absolute URL that starts with https is allowed to be used in SSR`);
  }

  return async (req: NextRequest, event: NextFetchEvent) => {
    const { headers } = req;

    const isSatellite = handleValueOrFn(opts.isSatellite, new URL(req.url), IS_SATELLITE);
    const domain = handleValueOrFn(opts.domain, new URL(req.url), DOMAIN);
    const signInUrl = opts?.signInUrl || SIGN_IN_URL;

    if (isSatellite && !proxyUrl && !domain) {
      throw new Error(`Missing domain and proxyUrl. A satellite application needs to specify a domain or a proxyUrl`);
    }

    if (
      isSatellite &&
      !signInUrl &&
      isDevOrStagingUrl(parsePublishableKey(PUBLISHABLE_KEY)?.frontendApi || FRONTEND_API)
    ) {
      throw new Error(`Missing signInUrl. Pass a signInUrl for dev instances if an app is satellite`);
    }

    if (isSatellite && !proxyUrl && !domain) {
      throw new Error(`Missing domain and proxyUrl. A satellite application needs to specify a domain or a proxyUrl`);
    }

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
      clientUat: getCookie(req, constants.Cookies.ClientUat),
      origin: headers.get('origin') || undefined,
      host: headers.get('host') as string,
      forwardedPort: headers.get('x-forwarded-port') || undefined,
      forwardedHost: headers.get('x-forwarded-host') || undefined,
      referrer: headers.get('referer') || undefined,
      userAgent: headers.get('user-agent') || undefined,
      proxyUrl,
      isSatellite,
      domain,
      searchParams: new URL(req.url).searchParams,
      signInUrl,
    });

    // Interstitial case
    // Note: there is currently no way to rewrite to a protected endpoint
    // Therefore we have to resort to a public interstitial endpoint
    if (requestState.isUnknown) {
      const response = new NextResponse(null, { status: 401, headers: { 'Content-Type': 'text/html' } });
      decorateResponseWithObservabilityHeaders(response, requestState);
      return response;
    }
    if (requestState.isInterstitial) {
      const response = NextResponse.rewrite(
        clerkClient.remotePublicInterstitialUrl({
          apiUrl: API_URL,
          frontendApi: FRONTEND_API,
          publishableKey: PUBLISHABLE_KEY,
          pkgVersion: JS_VERSION,
          proxyUrl: requestState.proxyUrl as any,
          isSatellite: requestState.isSatellite,
          domain: requestState.domain as any,
          debugData: debugRequestState(requestState),
          signInUrl: requestState.signInUrl,
        }),
        { status: 401 },
      );
      decorateResponseWithObservabilityHeaders(response, requestState);
      return response;
    }

    // Set auth result on request in a private property so that middleware can read it too
    setCustomAttributeOnRequest(req, constants.Attributes.AuthStatus, requestState.status);
    setCustomAttributeOnRequest(req, constants.Attributes.AuthMessage, requestState.message || '');
    setCustomAttributeOnRequest(req, constants.Attributes.AuthReason, requestState.reason || '');

    // get result from provided handler
    const res = await handler(req, event);

    const { status: authStatus, reason: authReason, message: authMessage } = requestState;

    return handleMiddlewareResult({ req, res, authStatus, authReason, authMessage });
  };
};

type HandleMiddlewareResultProps = {
  req: NextRequest;
  res: NextMiddlewareResult;
  authStatus: AuthStatus;
  authReason: string | null;
  authMessage: string | null;
};

// Auth result will be set as both a query param & header when applicable
export function handleMiddlewareResult({
  req,
  res,
  authStatus,
  authMessage,
  authReason,
}: HandleMiddlewareResultProps): NextMiddlewareResult {
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
      setRequestHeadersOnNextResponse(res, req, {
        [constants.Headers.AuthStatus]: authStatus,
        [constants.Headers.AuthMessage]: authMessage || '',
        [constants.Headers.AuthReason]: authReason || '',
      });
    } else {
      res.headers.set(constants.Headers.AuthStatus, authStatus);
      res.headers.set(constants.Headers.AuthMessage, authMessage || '');
      res.headers.set(constants.Headers.AuthReason, authReason || '');
      rewriteURL.searchParams.set(constants.SearchParams.AuthStatus, authStatus);
      rewriteURL.searchParams.set(constants.Headers.AuthMessage, authMessage || '');
      rewriteURL.searchParams.set(constants.Headers.AuthReason, authReason || '');
    }
    res.headers.set(nextConstants.Headers.NextRewrite, rewriteURL.href);
  }

  return res;
}
