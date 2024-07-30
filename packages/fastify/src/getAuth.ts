import type { AuthObject } from '@clerk/types';
import type { FastifyRequest } from 'fastify';

import { pluginRegistrationRequired } from './errors';

type FastifyRequestWithAuth = FastifyRequest & { auth: AuthObject };

export const getAuth = (req: FastifyRequest): AuthObject => {
  const authReq = req as FastifyRequestWithAuth;

  if (!authReq.auth) {
    throw new Error(pluginRegistrationRequired);
  }

  return authReq.auth;
};
