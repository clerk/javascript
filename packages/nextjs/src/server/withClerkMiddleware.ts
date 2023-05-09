import type { RequestState } from '@clerk/backend';
import { constants, debugRequestState } from '@clerk/backend';
import type { NextMiddleware } from 'next/dist/server/web/types';
import type { NextFetchEvent, NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

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
} from './clerkClient';
import { missingDomainAndProxy, missingSignInUrlInDev } from './errors';
import type { WithAuthOptions } from './types';
import {
  createProxyUrl,
  decorateRequest,
  getCookie,
  handleValueOrFn,
  isDevelopmentFromApiKey,
  isHttpOrHttps,
  setCustomAttributeOnRequest,
} from './utils';

export interface WithClerkMiddleware {
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

  return async (req: NextRequest, event: NextFetchEvent) => {
    const { headers } = req;

    const requestURL = createProxyUrl({
      request: req,
    });

    const relativeOrAbsoluteProxyUrl = handleValueOrFn(opts?.proxyUrl, new URL(requestURL), PROXY_URL);

    let proxyUrl;
    if (!!relativeOrAbsoluteProxyUrl && !isHttpOrHttps(relativeOrAbsoluteProxyUrl)) {
      proxyUrl = createProxyUrl({
        request: req,
        relativePath: relativeOrAbsoluteProxyUrl,
      });
    } else {
      proxyUrl = relativeOrAbsoluteProxyUrl;
    }

    const isSatellite = handleValueOrFn(opts.isSatellite, new URL(req.url), IS_SATELLITE);
    const domain = handleValueOrFn(opts.domain, new URL(req.url), DOMAIN);
    const signInUrl = opts?.signInUrl || SIGN_IN_URL;

    if (isSatellite && !proxyUrl && !domain) {
      throw new Error(missingDomainAndProxy);
    }

    if (isSatellite && !isHttpOrHttps(signInUrl) && isDevelopmentFromApiKey(SECRET_KEY || API_KEY)) {
      throw new Error(missingSignInUrlInDev);
    }

    // get auth state, check if we need to return an interstitial
    const cookieToken = getCookie(req, constants.Cookies.Session);
    const headerToken = headers.get('authorization')?.replace('Bearer ', '');
    const requestState = await clerkClient.authenticateRequest({
      ...opts,
      apiKey: opts.apiKey || API_KEY,
      secretKey: opts.secretKey || SECRET_KEY,
      frontendApi: opts.frontendApi || FRONTEND_API,
      publishableKey: opts.publishableKey || PUBLISHABLE_KEY,
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
          frontendApi: opts.frontendApi || FRONTEND_API,
          publishableKey: opts.publishableKey || PUBLISHABLE_KEY,
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
    return decorateRequest(req, res, requestState);
  };
};
