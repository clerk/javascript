import type {
  AuthenticateRequestOptions,
  GetAuthFn,
  SignedInAuthObject,
  SignedOutAuthObject,
} from '@clerk/backend/internal';
import {
  isTokenTypeAccepted,
  signedOutAuthObject,
  TokenType,
  unauthenticatedMachineObject,
} from '@clerk/backend/internal';
import type { PendingSessionOptions } from '@clerk/types';
import type { FastifyRequest } from 'fastify';

import { pluginRegistrationRequired } from './errors';

type GetAuthOptions = PendingSessionOptions & { acceptsToken?: AuthenticateRequestOptions['acceptsToken'] };

export const getAuth: GetAuthFn<FastifyRequest> = (req: FastifyRequest, options?: GetAuthOptions) => {
  const authReq = req as FastifyRequest & { auth: SignedInAuthObject | SignedOutAuthObject };

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
