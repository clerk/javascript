import type { RequestHandler } from 'express';

import { middlewareRequired } from './errors';
import { getAuth } from './getAuth';
import { requestHasAuthObject } from './utils';

/**
 * Middleware to require auth requests for user authenticated or authorized requests.
 * An HTTP 401 status code is returned for unauthenticated requests.
 *
 * @example
 * router.get('/path', requireAuth, getHandler)
 * //or
 * router.use(requireAuth)
 * @example
 * hasPermission = (request, response, next) => {
 *    const auth = getAuth(request);
 *    if (!auth.has({ permission: 'permission' })) {
 *      response.status(403).send('Forbidden');
 *      return;
 *    }
 *    return next();
 * }
 * router.get('/path', requireAuth, hasPermission, getHandler)
 *
 * @throws {Error} `clerkMiddleware` is required to be set in the middleware chain before this util is used.
 */
export const requireAuth: RequestHandler = (request, response, next) => {
  if (!requestHasAuthObject(request)) {
    throw new Error(middlewareRequired('requireAuth'));
  }

  if (!getAuth(request).userId) {
    response.status(401).send('Unauthorized');
    return;
  }

  return next();
};
