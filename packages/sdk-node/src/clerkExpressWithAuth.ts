import type { RequestState } from '@clerk/backend/internal';

import { authenticateRequest, setResponseHeaders } from './authenticateRequest';
import type { CreateClerkExpressMiddlewareOptions } from './clerkExpressRequireAuth';
import type { ClerkMiddlewareOptions, MiddlewareWithAuthProp, WithAuthProp } from './types';

export const createClerkExpressWithAuth = (createOpts: CreateClerkExpressMiddlewareOptions) => {
  const { clerkClient, secretKey = '', publishableKey = '' } = createOpts;
  return (options: ClerkMiddlewareOptions = {}): MiddlewareWithAuthProp => {
    return async (req, res, next) => {
      let requestState: RequestState;

      try {
        requestState = await authenticateRequest({
          clerkClient,
          secretKey,
          publishableKey,
          req,
          options,
        });
      } catch (e) {
        next(e);
        return;
      }

      const err = setResponseHeaders(requestState, res);
      if (err || res.writableEnded) {
        if (err) {
          next(err);
        }
        return;
      }

      (req as WithAuthProp<any>).auth = {
        ...requestState.toAuth(),
        claims: requestState.toAuth()?.sessionClaims,
      };
      next();
    };
  };
};
