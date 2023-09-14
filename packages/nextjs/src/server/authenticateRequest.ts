import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import type { RequestState } from './clerkClient';
import { clerkClient, debugRequestState } from './clerkClient';
import { CLERK_JS_URL, CLERK_JS_VERSION } from './constants';
import type { WithAuthOptions } from './types';
import { apiEndpointUnauthorizedNextResponse, handleMultiDomainAndProxy } from './utils';
import { decorateResponseWithObservabilityHeaders } from './withClerkMiddleware';

export const authenticateRequest = async (req: NextRequest, opts: WithAuthOptions) => {
  const { isSatellite, domain, signInUrl, proxyUrl } = handleMultiDomainAndProxy(req, opts);
  return await clerkClient.authenticateRequest({
    ...opts,
    isSatellite,
    domain,
    signInUrl,
    proxyUrl,
    request: req,
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
      frontendApi: opts.frontendApi as string,
      publishableKey: opts.publishableKey as string,
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
