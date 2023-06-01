import { constants } from '@clerk/backend';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import type { RequestState } from './clerkClient';
import {
  API_KEY,
  clerkClient,
  debugRequestState,
  FRONTEND_API,
  JS_VERSION,
  PUBLISHABLE_KEY,
  SECRET_KEY,
} from './clerkClient';
import type { WithAuthOptions } from './types';
import { getCookie } from './utils';
import { decorateResponseWithObservabilityHeaders } from './withClerkMiddleware';

export const authenticateRequest = async (req: NextRequest, opts: WithAuthOptions) => {
  const cookieToken = getCookie(req, constants.Cookies.Session);
  const headers = req.headers;
  const headerToken = headers.get('authorization')?.replace('Bearer ', '');
  return await clerkClient.authenticateRequest({
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
    searchParams: new URL(req.url).searchParams,
  } as any);
};

export const handleUnknownState = (requestState: RequestState) => {
  const response = new NextResponse(null, { status: 401, headers: { 'Content-Type': 'text/html' } });
  decorateResponseWithObservabilityHeaders(response, requestState);
  return response;
};

export const handleInterstitialState = (requestState: RequestState, opts: WithAuthOptions) => {
  const response = new NextResponse(
    clerkClient.localInterstitial({
      frontendApi: opts.frontendApi || FRONTEND_API,
      publishableKey: opts.publishableKey || PUBLISHABLE_KEY,
      pkgVersion: JS_VERSION,
      proxyUrl: requestState.proxyUrl as any,
      isSatellite: requestState.isSatellite,
      domain: requestState.domain as any,
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
