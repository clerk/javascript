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
import { apiEndpointUnauthorizedNextResponse, NextRequestAdapter } from './utils';
import { decorateResponseWithObservabilityHeaders } from './withClerkMiddleware';

export const authenticateRequest = async (req: NextRequest, opts: WithAuthOptions) => {
  return await clerkClient.authenticateRequest({
    ...opts,
    apiKey: opts.apiKey || API_KEY,
    secretKey: opts.secretKey || SECRET_KEY,
    frontendApi: opts.frontendApi || FRONTEND_API,
    publishableKey: opts.publishableKey || PUBLISHABLE_KEY,
    requestAdapter: new NextRequestAdapter(req),
  } as any);
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
