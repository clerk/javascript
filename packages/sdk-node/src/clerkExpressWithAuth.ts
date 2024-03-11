import { authenticateRequest, setResponseHeaders } from './authenticateRequest';
import type { CreateClerkExpressMiddlewareOptions } from './clerkExpressRequireAuth';
import type { ClerkMiddlewareOptions, MiddlewareWithAuthProp, WithAuthProp } from './types';

export const createClerkExpressWithAuth = (createOpts: CreateClerkExpressMiddlewareOptions) => {
  const { clerkClient, secretKey = '', publishableKey = '' } = createOpts;
  return (options: ClerkMiddlewareOptions = {}): MiddlewareWithAuthProp => {
    return async (req, res, next) => {
      const requestState = await authenticateRequest({
        clerkClient,
        secretKey,
        publishableKey,
        req,
        options,
      });

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
