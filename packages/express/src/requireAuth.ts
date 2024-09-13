import type { RequestHandler } from 'express';

import { middlewareRequired } from './errors';
import { getAuth } from './getAuth';
import { requestHasAuthObject } from './utils';

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
 * router.get(requireAuth)
 * app.use((err, req, res, next) => {
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
 *      response.status(403).json({ error: 'Forbidden' })
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
