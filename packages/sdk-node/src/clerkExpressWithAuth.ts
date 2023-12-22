import { AuthStatus } from '@clerk/backend/internal';

import { authenticateRequest, decorateResponseWithObservabilityHeaders } from './authenticateRequest';
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
      decorateResponseWithObservabilityHeaders(res, requestState);

      const hasLocationHeader = requestState.headers.get('location');
      if (hasLocationHeader) {
        // triggering a handshake redirect
        res.status(307).set(requestState.headers).end();
        return;
      }

      if (requestState.status === AuthStatus.Handshake) {
        next(new Error('Clerk: unexpected handshake without redirect'));
        return;
      }

      (req as WithAuthProp<any>).auth = {
        ...requestState.toAuth(),
        claims: requestState.toAuth().sessionClaims,
      };
      next();
    };
  };
};
