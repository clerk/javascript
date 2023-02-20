import type { AuthStatus, RequestState } from '@clerk/backend';
import { constants, convertToSHA1, debugRequestState } from '@clerk/backend';
import { requestProxyUrlToAbsoluteURL } from '@clerk/shared';
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
  PROXY_URL,
  PUBLISHABLE_KEY,
  SECRET_KEY,
} from './clerk';
import type { WithAuthOptions } from './types';
import {
  getCookie,
  handleIsSatelliteBooleanOrFn,
  nextJsVersionCanOverrideRequestHeaders,
  setAuthStatusOnRequest,
  setRequestHeadersOnNextResponse,
} from './utils';
import { isHttpOrHttps } from './utils';

interface WithClerkMiddleware {
  (handler: NextMiddleware, opts?: WithAuthOptions): NextMiddleware;

  (): NextMiddleware;
}

export const getCookieForInstance = (cookies: any, name: string) => {
  if (cookies[name]) {
    return cookies[name];
  }

  return cookies['__client_uat'];
};

export type buildCookieNameOptions = {
  publishableKey: string;
  domain: string;
  proxyUrl: string;
  isSatellite: boolean;
};

export const buildCookieName = async ({ options, request }: { options: buildCookieNameOptions; request: Request }) => {
  const { publishableKey, domain, proxyUrl, isSatellite } = options;
  const keyArray = [] as string[];

  if (publishableKey) {
    keyArray.push(publishableKey);
  }

  if (isSatellite && domain) {
    keyArray.push(domain);
  }

  if (proxyUrl) {
    keyArray.push(requestProxyUrlToAbsoluteURL(proxyUrl, new URL(request.url).origin));
  }

  const stringValue = keyArray.join('-');
  console.log(stringValue, 'stringValue');

  const toUint8 = new TextEncoder().encode(stringValue);

  // eslint-disable-next-line @typescript-eslint/await-thenable
  const result = await convertToSHA1(toUint8);
  return `__client_uat_${result.slice(0, 12)}`;
};

export const decorateResponseWithObservabilityHeaders = (res: NextResponse, requestState: RequestState) => {
  requestState.message && res.headers.set(constants.Headers.AuthMessage, requestState.message);
  requestState.reason && res.headers.set(constants.Headers.AuthReason, requestState.reason);
  requestState.status && res.headers.set(constants.Headers.AuthStatus, requestState.status);
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

    const isSatellite = handleIsSatelliteBooleanOrFn(opts, new URL(req.url)) || IS_SATELLITE;

    const clientUatName = await buildCookieName({
      options: { publishableKey: PUBLISHABLE_KEY, domain: DOMAIN, proxyUrl, isSatellite },
      request: req,
    });
    // console.log(clientUatName, 'clientUatName');
    // console.log(opts, 'opts');
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
      // @ts-expect-error
      isSatellite,
      domain: DOMAIN,
      isSynced: new URL(req.url).searchParams.get('__clerk_synced') === 'true',
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
          // @ts-expect-error
          proxyUrl: requestState.proxyUrl,
          isSatellite: requestState.isSatellite,
          domain: requestState.domain,
          debugData: debugRequestState(requestState),
        }),
        { status: 401 },
      );
      decorateResponseWithObservabilityHeaders(response, requestState);
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
