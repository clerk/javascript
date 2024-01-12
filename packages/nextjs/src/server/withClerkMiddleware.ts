import type { RequestState } from '@clerk/backend';
import { constants, debugRequestState } from '@clerk/backend';
import { deprecated } from '@clerk/shared/deprecated';
import type { NextFetchEvent, NextMiddleware, NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import {
  API_KEY,
  API_URL,
  CLERK_JS_URL,
  CLERK_JS_VERSION,
  clerkClient,
  FRONTEND_API,
  PUBLISHABLE_KEY,
  SECRET_KEY,
} from './clerkClient';
import type { WithAuthOptions } from './types';
import { decorateRequest, handleMultiDomainAndProxy, setCustomAttributeOnRequest } from './utils';

export interface WithClerkMiddleware {
  (handler: NextMiddleware, opts?: WithAuthOptions): NextMiddleware;

  (): NextMiddleware;
}

export const decorateResponseWithObservabilityHeaders = (res: NextResponse, requestState: RequestState) => {
  requestState.message && res.headers.set(constants.Headers.AuthMessage, encodeURIComponent(requestState.message));
  requestState.reason && res.headers.set(constants.Headers.AuthReason, encodeURIComponent(requestState.reason));
  requestState.status && res.headers.set(constants.Headers.AuthStatus, encodeURIComponent(requestState.status));
};

/**
 * @deprecated withClerkMiddleware has been deprecated in favor of `authMiddleware`.
 * For more details, consult the middleware documentation: https://clerk.com/docs/nextjs/middleware
 */
export const withClerkMiddleware: WithClerkMiddleware = (...args: unknown[]) => {
  const noop = () => undefined;
  const [handler = noop, opts = {}] = args as [NextMiddleware, WithAuthOptions] | [];

  deprecated(
    'withClerkMiddleware',
    'Use `authMiddleware` instead.\nFor more details, consult the middleware documentation: https://clerk.com/docs/nextjs/middleware',
  );

  return async (req: NextRequest, event: NextFetchEvent) => {
    const { isSatellite, domain, signInUrl, proxyUrl } = handleMultiDomainAndProxy(req, opts);

    // get auth state, check if we need to return an interstitial
    const requestState = await clerkClient.authenticateRequest({
      ...opts,
      apiKey: opts.apiKey || API_KEY,
      secretKey: opts.secretKey || SECRET_KEY,
      frontendApi: opts.frontendApi || FRONTEND_API,
      publishableKey: opts.publishableKey || PUBLISHABLE_KEY,
      isSatellite,
      domain,
      signInUrl,
      proxyUrl,
      request: req,
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
          clerkJSUrl: CLERK_JS_URL,
          clerkJSVersion: CLERK_JS_VERSION,
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
    setCustomAttributeOnRequest(req, constants.Attributes.AuthToken, requestState.token || '');
    setCustomAttributeOnRequest(req, constants.Attributes.AuthMessage, requestState.message || '');
    setCustomAttributeOnRequest(req, constants.Attributes.AuthReason, requestState.reason || '');

    // get result from provided handler
    const res = await handler(req, event);
    return decorateRequest(req, res, requestState);
  };
};
