import type { RequestState } from '@clerk/backend/internal';
import { AuthStatus } from '@clerk/backend/internal';
import type { FastifyReply, FastifyRequest } from 'fastify';

import { clerkClient } from './clerkClient';
import * as constants from './constants';
import type { ClerkFastifyOptions } from './types';
import { fastifyRequestToRequest } from './utils';

const decorateResponseWithObservabilityHeaders = (reply: FastifyReply, requestState: RequestState): FastifyReply => {
  return reply
    .header(constants.Headers.AuthStatus, requestState.status)
    .header(constants.Headers.AuthReason, requestState.reason)
    .header(constants.Headers.AuthMessage, requestState.message);
};

export const withClerkMiddleware = (options: ClerkFastifyOptions) => {
  return async (fastifyRequest: FastifyRequest, reply: FastifyReply) => {
    const req = fastifyRequestToRequest(fastifyRequest);

    const requestState = await clerkClient.authenticateRequest(req, {
      ...options,
      secretKey: options.secretKey || constants.SECRET_KEY,
      publishableKey: options.publishableKey || constants.PUBLISHABLE_KEY,
    });
    requestState.headers.forEach((value, key) => reply.header(key, value));

    const locationHeader = requestState.headers.get(constants.Headers.Location);
    if (locationHeader) {
      return decorateResponseWithObservabilityHeaders(reply, requestState).code(307).send();
    } else if (requestState.status === AuthStatus.Handshake) {
      throw new Error('Clerk: handshake status without redirect');
    }

    // @ts-expect-error Inject auth so getAuth can read it
    fastifyRequest.auth = requestState.toAuth();
  };
};
