import { constants } from '@clerk/backend';
import { parsePublishableKey } from '@clerk/shared/keys';
import { joinPaths } from '@clerk/shared/url';
import type { NextResponse } from 'next/server';

import { createClerkRequest } from './clerk-request';
import type { RequestState } from './clerkClient';
import { clerkClient } from './clerkClient';
import { API_VERSION, PUBLISHABLE_KEY, SECRET_KEY } from './constants';
import type { WithAuthOptions } from './types';
import { apiEndpointUnauthorizedNextResponse, handleMultiDomainAndProxy } from './utils';

export const authenticateRequest = async (
  req: Request,
  opts: WithAuthOptions,
  // handshakeToken: string | undefined,
) => {
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
    // handshakeToken,
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

/**
 * Init a handshake with Clerk FAPI by returning a 307 redirect to the /handshake endpoint.
 */
export const initHandshake = async (request: Request, opts: WithAuthOptions) => {
  const req = createClerkRequest(request);
  const parsedKey = parsePublishableKey(opts.publishableKey);
  if (!parsedKey) {
    throw new Error('Invalid publishable key');
  }

  const url = new URL(`https://${parsedKey.frontendApi}`);
  url.pathname = joinPaths(url.pathname, API_VERSION, '/handshake');
  url.searchParams.set('redirect_url', req.clerkUrl.toString());

  const dbJwt = req.clerkUrl.searchParams.get('__clerk_db_jwt') || req.cookies.get('__clerk_db_jwt');
  if (dbJwt) {
    url.searchParams.set('__clerk_db_jwt', dbJwt);
  }

  return Response.redirect(url);
};

/**
 * Complete a handshake by setting the cookies returned from the /handskake endpoint
 * The cookies are found in the `__clerk_handshake` cookie header
 */
// const completeHandshake = async (req: Request, opts: WithAuthOptions) => {};
