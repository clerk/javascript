import { parse } from 'cookie';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { clerkClient } from './clerkClient';
import * as constants from './constants';
import type { ClerkFastifyOptions } from './types';
import { getSingleValueFromArrayHeader } from './utils';

export const withClerkMiddleware = (options: ClerkFastifyOptions) => {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    const cookies = parse(req.raw.headers.cookie || '');
    const secretKey = options.secretKey || constants.SECRET_KEY;
    const publishableKey = options.publishableKey || constants.PUBLISHABLE_KEY;

    // get auth state, check if we need to return an interstitial
    const cookieToken = cookies[constants.Cookies.Session];
    const headerToken = req.headers['authorization']?.replace('Bearer ', '');

    const forwardedPort = getSingleValueFromArrayHeader(req.headers['x-forwarded-port']);
    const forwardedHost = getSingleValueFromArrayHeader(req.headers['x-forwarded-host']);

    const requestState = await clerkClient.authenticateRequest({
      ...options,
      secretKey,
      publishableKey,
      apiKey: constants.API_KEY,
      frontendApi: constants.FRONTEND_API,
      cookieToken,
      headerToken,
      clientUat: cookies[constants.Cookies.ClientUat],
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
        .header(constants.Headers.AuthReason, requestState.reason)
        .header(constants.Headers.AuthMessage, requestState.message)
        .send();
      return;
    }

    if (requestState.isInterstitial) {
      const interstitialHtmlPage = clerkClient.localInterstitial({
        publishableKey,
        frontendApi: constants.FRONTEND_API,
      });

      reply
        .code(401)
        .header(constants.Headers.AuthReason, requestState.reason)
        .header(constants.Headers.AuthMessage, requestState.message)
        .type('text/html')
        .send(interstitialHtmlPage);
      return;
    }

    // @ts-ignore
    req.auth = requestState.toAuth();
  };
};
