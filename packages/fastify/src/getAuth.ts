import type { AuthObject } from '@clerk/backend';
import type {
  AuthenticateRequestOptions,
  InferAuthObjectFromToken,
  InferAuthObjectFromTokenArray,
  MachineAuthObject,
  SessionAuthObject,
  SignedInAuthObject,
  SignedOutAuthObject,
} from '@clerk/backend/internal';
import {
  isTokenTypeAccepted,
  signedOutAuthObject,
  TokenType,
  unauthenticatedMachineObject,
} from '@clerk/backend/internal';
import type { FastifyRequest } from 'fastify';

import { pluginRegistrationRequired } from './errors';

type FastifyRequestWithAuth = FastifyRequest & { auth: SignedInAuthObject | SignedOutAuthObject };

type AuthOptions = { acceptsToken?: AuthenticateRequestOptions['acceptsToken'] };

interface GetAuthFn {
  /**
   * @example
   * const authObject = await getAuth(req, { acceptsToken: ['session_token', 'api_key'] })
   */
  <T extends TokenType[]>(
    req: FastifyRequest,
    options: AuthOptions & { acceptsToken: T },
  ): InferAuthObjectFromTokenArray<T, SessionAuthObject, MachineAuthObject<T[number]>>;

  /**
   * @example
   * const authObject = await getAuth(req, { acceptsToken: 'session_token' })
   */
  <T extends TokenType>(
    req: FastifyRequest,
    options: AuthOptions & { acceptsToken: T },
  ): InferAuthObjectFromToken<T, SessionAuthObject, MachineAuthObject<T>>;

  /**
   * @example
   * const authObject = await getAuth(req, { acceptsToken: 'any' })
   */
  (req: FastifyRequest, options: AuthOptions & { acceptsToken: 'any' }): AuthObject;

  /**
   * @example
   * const authObject = await getAuth(req)
   */
  (req: FastifyRequest): SessionAuthObject;
}

export const getAuth: GetAuthFn = (req: FastifyRequest, options?: AuthOptions) => {
  const authReq = req as FastifyRequestWithAuth;

  if (!authReq.auth) {
    throw new Error(pluginRegistrationRequired);
  }

  const acceptsToken = options?.acceptsToken ?? TokenType.SessionToken;
  const authObject = authReq.auth;

  if (acceptsToken === 'any') {
    return authObject;
  }

  if (!isTokenTypeAccepted(authObject.tokenType, acceptsToken)) {
    if (authObject.tokenType === TokenType.SessionToken) {
      return signedOutAuthObject(authObject.debug);
    }
    return unauthenticatedMachineObject(authObject.tokenType, authObject.debug);
  }

  return authObject;
};
