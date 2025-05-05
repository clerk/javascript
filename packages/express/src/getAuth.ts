import type { AuthObject } from '@clerk/backend';
import type { PendingSessionOptions } from '@clerk/types';
import type { Request as ExpressRequest } from 'express';

import { middlewareRequired } from './errors';
import { requestHasAuthObject } from './utils';

type GetAuthOptions = PendingSessionOptions;

/**
 * Retrieves the Clerk AuthObject using the current request object.
 *
 * @param {ExpressRequest} req - The current request object.
 * @param {GetAuthOptions} options - Optional configuration for retriving auth object.
 * @returns {AuthObject} Object with information about the request state and claims.
 * @throws {Error} `clerkMiddleware` or `requireAuth` is required to be set in the middleware chain before this util is used.
 */
export const getAuth = (req: ExpressRequest, options?: GetAuthOptions): AuthObject => {
  if (!requestHasAuthObject(req)) {
    throw new Error(middlewareRequired('getAuth'));
  }

  // this has to receive an option
  return req.auth(options);
};
