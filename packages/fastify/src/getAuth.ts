import type {
  AuthenticateRequestOptions,
  GetAuthFn,
  SignedInAuthObject,
  SignedOutAuthObject,
} from '@clerk/backend/internal';
import { getAuthObjectForAcceptedToken } from '@clerk/backend/internal';
import type { FastifyRequest } from 'fastify';

import { pluginRegistrationRequired } from './errors';

type GetAuthOptions = { acceptsToken?: AuthenticateRequestOptions['acceptsToken'] };

export const getAuth: GetAuthFn<FastifyRequest> = ((req: FastifyRequest, options?: GetAuthOptions) => {
  const authReq = req as FastifyRequest & { auth: SignedInAuthObject | SignedOutAuthObject };

  if (!authReq.auth) {
    throw new Error(pluginRegistrationRequired);
  }

  return getAuthObjectForAcceptedToken({ authObject: authReq.auth, acceptsToken: options?.acceptsToken });
}) as GetAuthFn<FastifyRequest>;
