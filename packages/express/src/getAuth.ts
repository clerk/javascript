import type { AuthenticateRequestOptions, GetAuthFn } from '@clerk/backend/internal';
import { getAuthObjectForAcceptedToken } from '@clerk/backend/internal';
import type { PendingSessionOptions } from '@clerk/types';
import type { Request as ExpressRequest } from 'express';

import { middlewareRequired } from './errors';
import { requestHasAuthObject } from './utils';

type GetAuthOptions = PendingSessionOptions & { acceptsToken?: AuthenticateRequestOptions['acceptsToken'] };

/**
 * Retrieves the Clerk AuthObject using the current request object.
 *
 * @param {GetAuthOptions} options - Optional configuration for retriving auth object.
 * @returns {AuthObject} Object with information about the request state and claims.
 * @throws {Error} `clerkMiddleware` or `requireAuth` is required to be set in the middleware chain before this util is used.
 */
export const getAuth: GetAuthFn<ExpressRequest> = ((req: ExpressRequest, options?: GetAuthOptions) => {
  if (!requestHasAuthObject(req)) {
    throw new Error(middlewareRequired('getAuth'));
  }

  const authObject = req.auth(options);

  // @ts-expect-error: todo
  console.log('tokenType from req.auth.tokenType:', req.auth.tokenType);
  console.log('tokenType from req.auth().tokenType:', authObject.tokenType);

  console.log('Calling getAuthObjectForAcceptedToken with:', {
    authObject,
    acceptsToken: options?.acceptsToken,
  });

  return getAuthObjectForAcceptedToken({ authObject, acceptsToken: options?.acceptsToken });
}) as GetAuthFn<ExpressRequest>;
