import type { AuthenticateRequestOptions } from '@clerk/backend';
import { constants, debugRequestState } from '@clerk/backend';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import type { RequestState } from './clerkClient';
import { clerkClient } from './clerkClient';
import { CLERK_JS_URL, CLERK_JS_VERSION, PUBLISHABLE_KEY, SECRET_KEY } from './constants';
import { apiEndpointUnauthorizedNextResponse, handleMultiDomainAndProxy } from './utils';

export const authenticateRequest = async (req: NextRequest, opts: AuthenticateRequestOptions) => {
  const { isSatellite, domain, signInUrl, proxyUrl } = handleMultiDomainAndProxy(req, opts);
  return await clerkClient.authenticateRequest({
    ...opts,
    secretKey: opts.secretKey || SECRET_KEY,
    publishableKey: opts.publishableKey || PUBLISHABLE_KEY,
    isSatellite,
    domain,
    signInUrl,
    proxyUrl,
    request: req,
  });
};

const decorateResponseWithObservabilityHeaders = (res: NextResponse, requestState: RequestState) => {
  requestState.message && res.headers.set(constants.Headers.AuthMessage, encodeURIComponent(requestState.message));
  requestState.reason && res.headers.set(constants.Headers.AuthReason, encodeURIComponent(requestState.reason));
  requestState.status && res.headers.set(constants.Headers.AuthStatus, encodeURIComponent(requestState.status));
};

export const handleUnknownState = (requestState: RequestState) => {
  const response = apiEndpointUnauthorizedNextResponse();
  decorateResponseWithObservabilityHeaders(response, requestState);
  return response;
};

export const handleInterstitialState = (requestState: RequestState, opts: AuthenticateRequestOptions) => {
  const response = new NextResponse(
    clerkClient.localInterstitial({
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
