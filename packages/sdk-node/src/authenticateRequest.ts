import type { Clerk, RequestState } from '@clerk/backend';
import { buildClientUatName, constants } from '@clerk/backend';
import cookie from 'cookie';
import type { IncomingMessage, ServerResponse } from 'http';

import type { ClerkMiddlewareOptions } from './types';
import { getClientUat } from './utils';

const parseCookies = (req: IncomingMessage) => {
  return cookie.parse(req.headers['cookie'] || '');
};

export const authenticateRequest = async (
  clerkClient: ReturnType<typeof Clerk>,
  apiKey: string,
  secretKey: string,
  frontendApi: string,
  publishableKey: string,
  req: IncomingMessage,
  options?: ClerkMiddlewareOptions,
) => {
  const cookies = parseCookies(req);
  const { jwtKey, authorizedParties } = options || {};

  const clientUatName = await buildClientUatName({
    options: { publishableKey },
    url: req.url as string,
  });

  return clerkClient.authenticateRequest({
    apiKey,
    secretKey,
    frontendApi,
    publishableKey,
    jwtKey,
    authorizedParties,
    cookieToken: cookies[constants.Cookies.Session] || '',
    headerToken: req.headers[constants.Headers.Authorization]?.replace('Bearer ', '') || '',
    clientUat: getClientUat(cookies, clientUatName) || '',
    host: req.headers.host as string,
    forwardedPort: req.headers[constants.Headers.ForwardedPort] as string,
    forwardedHost: req.headers[constants.Headers.ForwardedHost] as string,
    referrer: req.headers.referer,
    userAgent: req.headers['user-agent'] as string,
  });
};
export const handleUnknownCase = (res: ServerResponse, requestState: RequestState) => {
  if (requestState.isUnknown) {
    res.writeHead(401, { 'Content-Type': 'text/html' });
    res.end();
  }
};

export const handleInterstitialCase = (res: ServerResponse, requestState: RequestState, interstitial: string) => {
  if (requestState.isInterstitial) {
    res.writeHead(401, { 'Content-Type': 'text/html' });
    res.end(interstitial);
  }
};

export const decorateResponseWithObservabilityHeaders = (res: ServerResponse, requestState: RequestState) => {
  requestState.message && res.setHeader(constants.Headers.AuthMessage, requestState.message);
  requestState.reason && res.setHeader(constants.Headers.AuthReason, requestState.reason);
  requestState.status && res.setHeader(constants.Headers.AuthStatus, requestState.status);
};
