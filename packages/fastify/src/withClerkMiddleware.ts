import { parse } from 'cookie';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { clerkClient } from './clerk';
import { API_KEY, Cookies, FRONTEND_API, Headers, PUBLISHABLE_KEY, SECRET_KEY } from './constants';
import { getSingleValueFromArrayHeader } from './utils';

export const withClerkMiddleware = (options: Record<never, never>) => {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    const cookies = parse(req.raw.headers.cookie || '');

    // get auth state, check if we need to return an interstitial
    const cookieToken = cookies[Cookies.Session];
    const headerToken = req.headers['authorization']?.replace('Bearer ', '');

    const forwardedPort = getSingleValueFromArrayHeader(req.headers['x-forwarded-port']);
    const forwardedHost = getSingleValueFromArrayHeader(req.headers['x-forwarded-host']);

    const requestState = await clerkClient.authenticateRequest({
      ...options,
      apiKey: API_KEY,
      secretKey: SECRET_KEY,
      frontendApi: FRONTEND_API,
      publishableKey: PUBLISHABLE_KEY,
      cookieToken,
      headerToken,
      clientUat: cookies[Cookies.ClientUat],
      origin: req.headers['origin'] || undefined,
      host: req.headers['host'] as string,
      forwardedPort,
      forwardedHost,
      referrer: req.headers['referer'] || undefined,
      userAgent: req.headers['user-agent'] || undefined,
    });

    // Interstitial cases
    if (requestState.isUnknown) {
      reply
        .code(401)
        .header(Headers.AuthReason, requestState.reason)
        .header(Headers.AuthMessage, requestState.message)
        .send();
      return;
    }
    if (requestState.isInterstitial) {
      const interstitialHtmlPage = clerkClient.localInterstitial({
        frontendApi: FRONTEND_API,
        publishableKey: PUBLISHABLE_KEY,
      });
      reply
        .code(401)
        .header(Headers.AuthReason, requestState.reason)
        .header(Headers.AuthMessage, requestState.message)
        .type('text/html')
        .send(interstitialHtmlPage);
      return;
    }

    // @ts-ignore
    req.auth = requestState.toAuth();
  };
};
