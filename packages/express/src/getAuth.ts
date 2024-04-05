import type { AuthObject } from '@clerk/backend/internal';
import type { Request as ExpressRequest } from 'express';

import { middlewareRequired } from './errors';
import { isAuthInRequest } from './utils';

/**
 * Retrieves the Clerk AuthObject using the current request object.
 *
 * @param {ExpressRequest} req - The current request object.
 * @returns {AuthObject} Object with information about the request state and claims.
 * @throws {Error} `clerkMiddleware` is required to be set in the middleware chain before this util is used.
 */
export const getAuth = (req: ExpressRequest): AuthObject => {
  if (!isAuthInRequest(req)) {
    throw new Error(middlewareRequired('getAuth'));
  }

  return req.auth;
};
