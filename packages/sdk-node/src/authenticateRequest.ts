import { Clerk, constants, RequestState } from '@clerk/backend';
import { Request as ExpressRequest } from 'express';

import { ClerkMiddlewareOptions } from './types';

export const authenticateRequest = (
  clerkClient: ReturnType<typeof Clerk>,
  apiKey: string,
  frontendApi: string,
  publishableKey: string,
  req: ExpressRequest,
  options?: ClerkMiddlewareOptions,
) => {
  const { jwtKey, authorizedParties } = options || {};
  return clerkClient.authenticateRequest({
    apiKey,
    frontendApi,
    publishableKey,
    jwtKey,
    authorizedParties,
    cookieToken: req.cookies[constants.Cookies.Session] || '',
    headerToken: req.headers[constants.Headers.Authorization]?.replace('Bearer ', '') || '',
    clientUat: req.cookies[constants.Cookies.ClientUat] || '',
    host: req.headers.host as string,
    forwardedPort: req.headers[constants.Headers.ForwardedPort] as string,
    forwardedHost: req.headers[constants.Headers.ForwardedHost] as string,
    referrer: req.headers.referer,
    userAgent: req.headers['user-agent'] as string,
  });
};

export const handleInterstitialCase = (res: any, requestState: RequestState, interstitial: string) => {
  if (requestState.isInterstitial) {
    res.setHeader(constants.Headers.AuthMessage, requestState.message);
    res.setHeader(constants.Headers.AuthReason, requestState.reason);
    res.writeHead(401, { 'Content-Type': 'text/html' });
    res.end(interstitial);
  }
};
