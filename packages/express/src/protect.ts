import type { RequestHandler } from 'express';

import { middlewareRequired } from './errors';
import { defaultHandler, isAuthInRequest } from './utils';

/**
 * @example
 * router.get('/path', protect(), getHandler)
 * 
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
 */
export const protect = (handler?: RequestHandler): RequestHandler[] => {
  const protectMiddleware: RequestHandler = (request, response, next) => {
    if (!isAuthInRequest(request)) {
      throw new Error(middlewareRequired);
    }
    if (!request.auth.userId) {
      response.status(401).send('Unauthorized');
      return;
    }

    return next();
  };

  return [protectMiddleware, handler || defaultHandler];
};
