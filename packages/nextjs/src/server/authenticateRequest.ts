import { constants } from '@clerk/backend';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import type { RequestState } from './clerkClient';
import {
  API_KEY,
  CLERK_JS_URL,
  CLERK_JS_VERSION,
  clerkClient,
  debugRequestState,
  FRONTEND_API,
  PUBLISHABLE_KEY,
  SECRET_KEY,
} from './clerkClient';
import type { WithAuthOptions } from './types';
import { apiEndpointUnauthorizedNextResponse, getCookie, handleMultiDomainAndProxy } from './utils';
import { decorateResponseWithObservabilityHeaders } from './withClerkMiddleware';

export const authenticateRequest = async (req: NextRequest, opts: WithAuthOptions) => {
  const { isSatellite, domain, signInUrl, proxyUrl } = handleMultiDomainAndProxy(req, opts);
  const cookieToken = getCookie(req, constants.Cookies.Session);
  const headers = req.headers;
  const headerToken = headers.get('authorization')?.replace('Bearer ', '');
  return await clerkClient.authenticateRequest({
    ...opts,
    apiKey: opts.apiKey || API_KEY,
    secretKey: opts.secretKey || SECRET_KEY,
    frontendApi: opts.frontendApi || FRONTEND_API,
    publishableKey: opts.publishableKey || PUBLISHABLE_KEY,
    isSatellite,
    domain,
    signInUrl,
    proxyUrl,
    cookieToken,
    headerToken,
    clientUat: getCookie(req, constants.Cookies.ClientUat),
    sessionUat: getCookie(req, constants.Cookies.SessionUat),
    origin: headers.get('origin') || undefined,
    host: headers.get('host') as string,
    forwardedPort: headers.get('x-forwarded-port') || undefined,
    forwardedHost: headers.get('x-forwarded-host') || undefined,
    forwardedProto: headers.get('x-forwarded-proto') || undefined,
    referrer: headers.get('referer') || undefined,
    userAgent: headers.get('user-agent') || undefined,
    searchParams: new URL(req.url).searchParams,
  });
};

export const handleUnknownState = (requestState: RequestState) => {
  const response = apiEndpointUnauthorizedNextResponse();
  decorateResponseWithObservabilityHeaders(response, requestState);
  return response;
};

export const handleInterstitialState = (requestState: RequestState, opts: WithAuthOptions) => {
  const response = new NextResponse(
    clerkClient.localInterstitial({
      frontendApi: opts.frontendApi || FRONTEND_API,
      publishableKey: opts.publishableKey || PUBLISHABLE_KEY,
      clerkJSUrl: CLERK_JS_URL,
      clerkJSVersion: CLERK_JS_VERSION,
      proxyUrl: requestState.proxyUrl,
      isSatellite: requestState.isSatellite,
      domain: requestState.domain,
      debugData: debugRequestState(requestState),
      signInUrl: requestState.signInUrl,
    }),
    {
      status: 401,
      headers: {
        'content-type': 'text/html',
      },
    },
  );
  decorateResponseWithObservabilityHeaders(response, requestState);
  return response;
};
