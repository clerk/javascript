import type { AuthObject } from '@clerk/backend';
import type {
  AuthenticateRequestOptions,
  InferAuthObjectFromToken,
  InferAuthObjectFromTokenArray,
  MachineAuthObject,
  SessionAuthObject,
} from '@clerk/backend/internal';
import {
  isTokenTypeAccepted,
  signedOutAuthObject,
  TokenType,
  unauthenticatedMachineObject,
} from '@clerk/backend/internal';
import type { PendingSessionOptions } from '@clerk/types';
import type { Request as ExpressRequest } from 'express';

import { middlewareRequired } from './errors';
import { requestHasAuthObject } from './utils';

type AuthOptions = PendingSessionOptions & { acceptsToken?: AuthenticateRequestOptions['acceptsToken'] };

interface GetAuthFn {
  /**
   * @example
   * const authObject = await getAuth(req, { acceptsToken: ['session_token', 'api_key'] })
   */
  <T extends TokenType[]>(
    req: ExpressRequest,
    options: AuthOptions & { acceptsToken: T },
  ): InferAuthObjectFromTokenArray<T, SessionAuthObject, MachineAuthObject<T[number]>>;

  /**
   * @example
   * const authObject = await getAuth(req, { acceptsToken: 'session_token' })
   */
  <T extends TokenType>(
    req: ExpressRequest,
    options: AuthOptions & { acceptsToken: T },
  ): InferAuthObjectFromToken<T, SessionAuthObject, MachineAuthObject<T>>;

  /**
   * @example
   * const authObject = await getAuth(req, { acceptsToken: 'any' })
   */
  (req: ExpressRequest, options: AuthOptions & { acceptsToken: 'any' }): AuthObject;

  /**
   * @example
   * const authObject = await getAuth(req)
   */
  (req: ExpressRequest, options?: PendingSessionOptions): SessionAuthObject;
}

/**
 * Retrieves the Clerk AuthObject using the current request object.
 *
 * @param {GetAuthOptions} options - Optional configuration for retriving auth object.
 * @returns {AuthObject} Object with information about the request state and claims.
 * @throws {Error} `clerkMiddleware` or `requireAuth` is required to be set in the middleware chain before this util is used.
 */
export const getAuth: GetAuthFn = (req: ExpressRequest, options?: AuthOptions) => {
  if (!requestHasAuthObject(req)) {
    throw new Error(middlewareRequired('getAuth'));
  }

  const authObject = req.auth(options);

  const acceptsToken = options?.acceptsToken ?? TokenType.SessionToken;

  if (acceptsToken === 'any') {
    return authObject;
  }

  if (!isTokenTypeAccepted(authObject.tokenType, acceptsToken)) {
    if (authObject.tokenType === TokenType.SessionToken) {
      return signedOutAuthObject();
    }
    return unauthenticatedMachineObject(authObject.tokenType);
  }

  return authObject;
};
