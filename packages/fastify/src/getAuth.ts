import type { SignedInAuthObject, SignedOutAuthObject } from '@clerk/backend/internal';
import type { FastifyRequest } from 'fastify';

import { pluginRegistrationRequired } from './errors';

type FastifyRequestWithAuth = FastifyRequest & { auth: SignedInAuthObject | SignedOutAuthObject };

export const getAuth = (req: FastifyRequest): SignedInAuthObject | SignedOutAuthObject => {
  const authReq = req as FastifyRequestWithAuth;

  if (!authReq.auth) {
    throw new Error(pluginRegistrationRequired);
  }

  return authReq.auth;
};
