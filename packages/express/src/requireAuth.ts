import type { RequestHandler } from 'express';

import { authenticateAndDecorateRequest } from './authenticateRequest';
import type { ClerkMiddlewareOptions, ExpressRequestWithAuth } from './types';

/**
 * Middleware to require authentication for user requests.
 * Redirects unauthenticated requests to the sign-in page.
 *
 * @example
 * // Basic usage
 * import { requireAuth } from '@clerk/express'
 *
 * router.get('/path', requireAuth(), getHandler)
 * //or
 * router.use(requireAuth())
 *
 * @example
 * // Customizing the sign-in path
 * router.use(requireAuth({ signInPath: '/custom-signin' }))
 *
 * @example
 * // Combining with permission check
 * import { requireAuth, ForbiddenError } from '@clerk/express'
 *
 * const hasPermission = (req, res, next) => {
 *    const auth = getAuth(req)
 *    if (!auth.has({ permission: 'permission' })) {
 *      return next(new ForbiddenError())
 *    }
 *    return next()
 * }
 * router.get('/path', requireAuth(), hasPermission, getHandler)
 *
 * @throws {Error} If `clerkMiddleware` is not set in the middleware chain before this util is used.
 */
export const requireAuth = (options: ClerkMiddlewareOptions = {}): RequestHandler => {
  const authMiddleware = authenticateAndDecorateRequest(options);

  return (request, response, next) => {
    authMiddleware(request, response, err => {
      if (err) {
        return next(err);
      }

      const signInUrl = options.signInUrl || process.env.CLERK_SIGN_IN_URL || '/';

      if (!(request as ExpressRequestWithAuth).auth?.userId) {
        return response.redirect(signInUrl);
      }

      next();
    });
  };
};
