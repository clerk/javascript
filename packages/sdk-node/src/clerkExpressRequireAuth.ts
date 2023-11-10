import type { Clerk } from '@clerk/backend';

import {
  authenticateRequest,
  decorateResponseWithObservabilityHeaders,
  handleInterstitialCase,
  handleUnknownCase,
  loadInterstitial,
} from './authenticateRequest';
import type { ClerkMiddlewareOptions, MiddlewareRequireAuthProp, RequireAuthProp } from './types';

export type CreateClerkExpressMiddlewareOptions = {
  clerkClient: ReturnType<typeof Clerk>;
  /* Secret Key */
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
      if (requestState.isUnknown) {
        return handleUnknownCase(res, requestState);
      }
      if (requestState.isInterstitial) {
        const interstitial = await loadInterstitial({
          clerkClient,
          requestState,
        });
        return handleInterstitialCase(res, requestState, interstitial);
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
