import type { RequestHandler } from 'express';

import { authenticateAndDecorateRequest } from './authenticateRequest';
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
  const authMiddleware = authenticateAndDecorateRequest(options);

  return (request, response, next) => {
    authMiddleware(request, response, next);
  };
};
