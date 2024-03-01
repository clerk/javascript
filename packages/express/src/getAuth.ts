import type { AuthObject } from '@clerk/backend/internal';
import type { Request as ExpressRequest } from 'express';

import { middlewareRequired } from './errors';
import { isAuthInRequest } from './utils';

export const getAuth = (req: ExpressRequest): AuthObject => {
  if (!isAuthInRequest(req)) {
    throw new Error(middlewareRequired);
  }

  return req.auth;
};
