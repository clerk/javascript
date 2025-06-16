import type { RequestHandler } from 'express';

import { authenticateAndDecorateRequest } from './authenticateRequest';
import type { ClerkMiddlewareOptions, ExpressRequestWithAuth } from './types';

/**
 * Middleware to require authentication for user requests.
 * Redirects unauthenticated requests to the sign-in url.
 *
 * @example
 * // Basic usage
 * import { requireAuth } from '@clerk/express'
 *
 * router.use(requireAuth())
 * //or
 * router.get('/path', requireAuth(), getHandler)
 *
 * @example
 * // Customizing the sign-in path
 * router.use(requireAuth({ signInUrl: '/sign-in' }))
 *
 * @example
 * // Combining with permission check
 * import { getAuth, requireAuth } from '@clerk/express'
 *
 * const hasPermission = (req, res, next) => {
 *    const auth = getAuth(req)
 *    if (!auth.has({ permission: 'permission' })) {
 *      return res.status(403).send('Forbidden')
 *    }
 *    return next()
 * }
 * router.get('/path', requireAuth(), hasPermission, getHandler)
 */
export const requireAuth = (options: ClerkMiddlewareOptions = {}): RequestHandler => {
  const authMiddleware = authenticateAndDecorateRequest({
    ...options,
    acceptsToken: 'any',
  });

  return (request, response, next) => {
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
