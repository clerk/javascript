import type { Clerk } from '@clerk/backend';

import {
  authenticateRequest,
  decorateResponseWithObservabilityHeaders,
  handleInterstitialCase,
  handleUnknownCase,
} from './authenticateRequest';
import type { ClerkMiddlewareOptions, MiddlewareRequireAuthProp, RequireAuthProp } from './types';

export type CreateClerkExpressMiddlewareOptions = {
  clerkClient: ReturnType<typeof Clerk>;
  /**
   * @deprecated Use `secretKey` instead.
   */
  apiKey?: string;
  /* Secret Key */
  secretKey?: string;
  /**
   * @deprecated Use `publishableKey` instead.
   */
  frontendApi?: string;
  publishableKey?: string;
  apiUrl?: string;
};

export const createClerkExpressRequireAuth = (createOpts: CreateClerkExpressMiddlewareOptions) => {
  const { clerkClient, frontendApi = '', apiKey = '', secretKey = '', publishableKey = '' } = createOpts;

  return (options: ClerkMiddlewareOptions = {}): MiddlewareRequireAuthProp => {
    return async (req, res, next) => {
      const requestState = await authenticateRequest(
        clerkClient,
        apiKey,
        secretKey,
        frontendApi,
        publishableKey,
        req,
        options,
      );
      decorateResponseWithObservabilityHeaders(res, requestState);
      if (requestState.isUnknown) {
        return handleUnknownCase(res, requestState);
      }
      if (requestState.isInterstitial) {
        const interstitial = await clerkClient.remotePrivateInterstitial();
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
