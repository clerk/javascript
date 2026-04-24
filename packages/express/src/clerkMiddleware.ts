import type { RequestHandler } from 'express';

import { authenticateAndDecorateRequest } from './authenticateRequest';
import type { ClerkMiddlewareOptions, ClerkMiddlewareOptionsCallback } from './types';

/**
 * Middleware that integrates Clerk authentication into your Express application.
 * It checks the request's cookies and headers for a session JWT and, if found,
 * attaches the Auth object to the request object under the `auth` key.
 *
 * Accepts either a static options object or a callback that receives the request
 * and returns options. The callback form is useful for multi-domain setups where
 * the publishable key differs per domain.
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
 *
 * @example
 * // Dynamic keys per domain
 * app.use(clerkMiddleware((req) => ({
 *   publishableKey: req.hostname === 'example.com' ? PK_A : PK_B,
 *   secretKey: req.hostname === 'example.com' ? SK_A : SK_B,
 * })));
 */
export const clerkMiddleware = (
  options: ClerkMiddlewareOptions | ClerkMiddlewareOptionsCallback = {},
): RequestHandler => {
  if (typeof options !== 'function') {
    const authMiddleware = authenticateAndDecorateRequest({
      ...options,
      acceptsToken: 'any',
    });
    return (request, response, next) => {
      authMiddleware(request, response, next);
    };
  }

  return async (request, response, next) => {
    try {
      const resolvedOptions = await options(request);
      const handler = authenticateAndDecorateRequest({
        ...resolvedOptions,
        acceptsToken: 'any',
      });
      handler(request, response, next);
    } catch (err) {
      next(err);
    }
  };
};
