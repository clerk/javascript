import type { RequestHandler } from 'express';

import { middlewareRequired } from './errors';
import { getAuth } from './getAuth';
import { requestHasAuthObject } from './utils';

/**
 * Represents an error for unauthenticated requests.
 *
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
 * Middleware to require authentication for user requests.
 * Passes an UnauthorizedError to the next middleware for unauthenticated requests,
 * which should be handled by an error middleware.
 *
 * @example
 * // Basic usage
 * import { requireAuth, UnauthorizedError } from '@clerk/express'
 *
 * router.get('/path', requireAuth, getHandler)
 * //or
 * router.use(requireAuth)
 *
 * router.use((err, req, res, next) => {
 *   if (err instanceof UnauthorizedError) {
 *     res.status(401).send('Unauthorized')
 *   } else {
 *     next(err)
 *   }
 * })
 *
 * @example
 * // Combining with permission check
 * const hasPermission = (request, response, next) => {
 *    const auth = getAuth(request)
 *    if (!auth.has({ permission: 'permission' })) {
 *      response.status(403).send('Forbidden')
 *      return
 *    }
 *    return next()
 * }
 * router.get('/path', requireAuth, hasPermission, getHandler)
 *
 * @throws {Error} If `clerkMiddleware` is not set in the middleware chain before this util is used.
 */
export const requireAuth: RequestHandler = (request, _response, next) => {
  if (!requestHasAuthObject(request)) {
    throw new Error(middlewareRequired('requireAuth'));
  }

  if (!getAuth(request).userId) {
    return next(new UnauthorizedError());
  }

  return next();
};
