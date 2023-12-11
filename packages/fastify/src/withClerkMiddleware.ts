import { AuthStatus } from '@clerk/backend';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { clerkClient } from './clerkClient';
import * as constants from './constants';
import type { ClerkFastifyOptions } from './types';
import { fastifyRequestToRequest } from './utils';

export const withClerkMiddleware = (options: ClerkFastifyOptions) => {
  return async (fastifyRequest: FastifyRequest, reply: FastifyReply) => {
    const secretKey = options.secretKey || constants.SECRET_KEY;
    const publishableKey = options.publishableKey || constants.PUBLISHABLE_KEY;
    const req = fastifyRequestToRequest(fastifyRequest);

    const requestState = await clerkClient.authenticateRequest(req, {
      ...options,
      secretKey,
      publishableKey,
      request: req,
    });

    if (requestState.status === AuthStatus.Handshake) {
      // @TODO handshake
      // return reply
      //   .code(401)
      //   .header(constants.Headers.AuthReason, requestState.reason)
      //   .header(constants.Headers.AuthMessage, requestState.message)
      //   .type('text/html')
      //   .send(...);
    }

    // @ts-expect-error Inject auth so getAuth can read it
    fastifyRequest.auth = requestState.toAuth();
  };
};
