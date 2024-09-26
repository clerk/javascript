import type { RequestHandler } from 'express';

import { authenticateAndDecorateRequest } from './authenticateRequest';
import type { ClerkMiddlewareOptions } from './types';

/**
 * This error is typically thrown by the `requireAuth` middleware when
 * a request is made to a protected route without proper authentication.
 *
 * @class
 * @extends Error
 *
 * @example
 * // This error is usually handled in an Express error handling middleware
 * app.use((err, req, res, next) => {
 *   if (err instanceof UnauthorizedError) {
 *     res.status(401).send('Unauthorized');
 *   } else {
 *     next(err);
 *   }
 * });
 */
export class UnauthorizedError extends Error {
  constructor() {
    super('Unauthorized');
    this.name = 'UnauthorizedError';
  }
}

/**
 * This error is typically used when a user is authenticated but lacks the necessary permissions
 * to access a resource or perform an action.
 *
 * @class
 * @extends Error
 *
 * @example
 * // This error can be used in custom authorization middleware
 * const checkPermission = (req, res, next) => {
 *   const auth = getAuth(req)
 *   if (!auth.has({ permission: 'permission' })) {
 *     return next(new ForbiddenError());
 *   }
 *   next();
 * };
 *
 * @example
 * // This error is usually handled in an Express error handling middleware
 * app.use((err, req, res, next) => {
 *   if (err instanceof ForbiddenError) {
 *     res.status(403).send('Forbidden');
 *   } else {
 *     next(err);
 *   }
 * });
 */
export class ForbiddenError extends Error {
  constructor() {
    super('Forbidden');
    this.name = 'ForbiddenError';
  }
}

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

      // @ts-expect-error: TODO, type this
      if (!request.auth?.userId) {
        return response.redirect(signInUrl);
      }

      next();
    });
  };
};
