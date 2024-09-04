import type { createClerkClient } from '@clerk/backend';
import type { RequestState } from '@clerk/backend/internal';

import { authenticateRequest, setResponseHeaders } from './authenticateRequest';
import type { ClerkMiddlewareOptions, MiddlewareRequireAuthProp, RequireAuthProp } from './types';

export type CreateClerkExpressMiddlewareOptions = {
  clerkClient: ReturnType<typeof createClerkClient>;
  secretKey?: string;
  publishableKey?: string;
  apiUrl?: string;
};

export const createClerkExpressRequireAuth = (createOpts: CreateClerkExpressMiddlewareOptions) => {
  const { clerkClient, secretKey = '', publishableKey = '' } = createOpts;

  return (options: ClerkMiddlewareOptions = {}): MiddlewareRequireAuthProp => {
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

      if (requestState.isSignedIn) {
        (req as RequireAuthProp<any>).auth = { ...requestState.toAuth(), claims: requestState.toAuth().sessionClaims };
        next();
        return;
      }

      next(new Error('Unauthenticated'));
    };
  };
};
