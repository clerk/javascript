import { createIsomorphicRequest } from '@clerk/backend';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { clerkClient } from './clerkClient';
import * as constants from './constants';
import type { ClerkFastifyOptions } from './types';

export const withClerkMiddleware = (options: ClerkFastifyOptions) => {
  return async (req: FastifyRequest, reply: FastifyReply) => {
    const secretKey = options.secretKey || constants.SECRET_KEY;
    const publishableKey = options.publishableKey || constants.PUBLISHABLE_KEY;

    const requestState = await clerkClient.authenticateRequest({
      ...options,
      secretKey,
      publishableKey,
      apiKey: constants.API_KEY,
      frontendApi: constants.FRONTEND_API,
      request: createIsomorphicRequest((Request, Headers) => {
        const requestHeaders = Object.keys(req.headers).reduce(
          (acc, key) => Object.assign(acc, { [key]: req?.headers[key] }),
          {},
        );
        // Making some manual tests it seems that FastifyRequest populates the req protocol / hostname
        // based on the forwarded headers. With that in mind we can use those attributes instead
        // of using the headers to calculate them by our own.
        const reqUrl = new URL(req.url, `${req.protocol}://${req.hostname}`);
        const headers = new Headers(requestHeaders);

        return new Request(reqUrl, {
          method: req.method,
          headers,
        });
      }),
    });

    // Interstitial cases
    if (requestState.isUnknown) {
      return reply
        .code(401)
        .header(constants.Headers.AuthReason, requestState.reason)
        .header(constants.Headers.AuthMessage, requestState.message)
        .send();
    }

    if (requestState.isInterstitial) {
      const interstitialHtmlPage = clerkClient.localInterstitial({
        publishableKey,
        frontendApi: constants.FRONTEND_API,
      });

      return reply
        .code(401)
        .header(constants.Headers.AuthReason, requestState.reason)
        .header(constants.Headers.AuthMessage, requestState.message)
        .type('text/html')
        .send(interstitialHtmlPage);
    }

    // @ts-ignore
    req.auth = requestState.toAuth();
  };
};
