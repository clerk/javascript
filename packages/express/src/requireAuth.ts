import type { RequestHandler } from 'express';

import { deprecated } from '@clerk/shared/deprecated';

import { authenticateAndDecorateRequest } from './authenticateRequest';
import type { ClerkMiddlewareOptions, ExpressRequestWithAuth } from './types';

/**
 * Middleware to require authentication for user requests.
 * Redirects unauthenticated requests to the sign-in url.
 *
 * @deprecated Use `clerkMiddleware()` with `getAuth()` instead.
 * `requireAuth` will be removed in the next major version.
 *
 * @example
 * // Before (deprecated)
 * import { requireAuth } from '@clerk/express'
 * router.get('/path', requireAuth(), getHandler)
 *
 * @example
 * // After (recommended)
 * import { clerkMiddleware, getAuth } from '@clerk/express'
 *
 * app.use(clerkMiddleware())
 *
 * app.get('/api/protected', (req, res) => {
 *   const { userId } = getAuth(req);
 *   if (!userId) {
 *     return res.status(401).json({ error: 'Unauthorized' });
 *   }
 *   // handle authenticated request
 * })
 */
export const requireAuth = (options: ClerkMiddlewareOptions = {}): RequestHandler => {
  const authMiddleware = authenticateAndDecorateRequest({
    ...options,
    acceptsToken: 'any',
  });

  return (request, response, next) => {
    deprecated(
      'requireAuth',
      'Use `clerkMiddleware()` with `getAuth()` instead. `requireAuth` will be removed in the next major version.',
    );

    authMiddleware(request, response, err => {
      if (err) {
        return next(err);
      }

      const signInUrl = options.signInUrl || process.env.CLERK_SIGN_IN_URL || '/';

      if (!(request as ExpressRequestWithAuth).auth()?.userId) {
        return response.redirect(signInUrl);
      }

      next();
    });
  };
};
