import type { RequestHandler } from 'express';

import { authenticateRequest, setResponseHeaders } from './authenticateRequest';
import { clerkClient as defaultClerkClient } from './clerkClient';
import type { ClerkMiddlewareOptions } from './types';

/**
 * @example
 * app.use(clerkMiddleware(options));
 *
 * @example
 * const clerkClient = createClerkClient({ ... });
 * app.use(clerkMiddleware({ clerkClient }));
 *
 * @example
 * app.use(clerkMiddleware());
 */
export const clerkMiddleware = (options: ClerkMiddlewareOptions = {}): RequestHandler => {
  const clerkClient = options.clerkClient || defaultClerkClient;
  const enableHandshake = options.enableHandshake || false;

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  const middleware: RequestHandler = async (request, response, next) => {
    try {
      const requestState = await authenticateRequest({
        clerkClient,
        request,
        options,
      });

      if (enableHandshake) {
        const err = setResponseHeaders(requestState, response);
        if (err || response.writableEnded) {
          if (err) {
            next(err);
          }
          return;
        }
      }

      Object.assign(request, { auth: requestState.toAuth() });

      return next();
    } catch (err) {
      next(err);
    }
  };

  return middleware;
};
