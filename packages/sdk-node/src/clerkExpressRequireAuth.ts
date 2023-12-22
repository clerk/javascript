import type { createClerkClient } from '@clerk/backend';
import { AuthStatus } from '@clerk/backend/internal';

import { authenticateRequest, decorateResponseWithObservabilityHeaders } from './authenticateRequest';
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
