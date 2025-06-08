import type { RequestHandler } from 'express';

import { authenticateAndDecorateRequest } from './authenticateRequest';
import type { ClerkMiddlewareOptions } from './types';

/**
 * Middleware that integrates Clerk authentication into your Express application.
 * It checks the request's cookies and headers for a session JWT and, if found,
 * attaches the Auth object to the request object under the `auth` key.
 *
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
  const authMiddleware = authenticateAndDecorateRequest({
    ...options,
    acceptsToken: 'any',
  });

  return (request, response, next) => {
    authMiddleware(request, response, next);
  };
};
