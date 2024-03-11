import type { RequestHandler } from 'express';

import { getAuth } from './getAuth';
import { defaultHandler } from './utils';

/**
 * Middleware to protect requests for user authenticated or authorized requests.
 * An HTTP 401 status code is returned for unauthenticated requests and it can receive
 * a RequestHandler argument to support authorization checks (as shown in the 2nd example).
 *
 * @example
 * router.get('/path', protect(), getHandler)
 * @example
 * hasPermission = (request, response, next) => {
    const auth = getAuth(request);
    if (!auth.has('perm')) {
      reply.status(403).send('Forbidden');
      return;
    }
    return next();
  }
 * router.get('/path', protect(hasPermission), getHandler)
 *
 * @throws {Error} `clerkMiddleware` is required to be set in the middleware chain before this util is used.
 */
export const protect = (handler?: RequestHandler): RequestHandler[] => {
  const protectMiddleware: RequestHandler = (request, response, next) => {
    if (!getAuth(request).userId) {
      response.status(401).send('Unauthorized');
      return;
    }

    return next();
  };

  return [protectMiddleware, handler || defaultHandler];
};
