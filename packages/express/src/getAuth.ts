import type { SignedInAuthObject, SignedOutAuthObject } from '@clerk/backend/internal';
import type { Request as ExpressRequest } from 'express';

import { middlewareRequired } from './errors';
import { requestHasAuthObject } from './utils';

/**
 * Retrieves the Clerk AuthObject using the current request object.
 *
 * @param {ExpressRequest} req - The current request object.
 * @returns {SignedInAuthObject | SignedOutAuthObject} Object with information about the request state and claims.
 * @throws {Error} `clerkMiddleware` or `requireAuth` is required to be set in the middleware chain before this util is used.
 */
export const getAuth = (req: ExpressRequest): SignedInAuthObject | SignedOutAuthObject => {
  if (!requestHasAuthObject(req)) {
    throw new Error(middlewareRequired('getAuth'));
  }

  return req.auth;
};
