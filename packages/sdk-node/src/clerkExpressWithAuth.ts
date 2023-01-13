import { authenticateRequest, handleInterstitialCase } from './authenticateRequest';
import { CreateClerkExpressMiddlewareOptions } from './clerkExpressRequireAuth';
import type { ClerkMiddlewareOptions, MiddlewareWithAuthProp, WithAuthProp } from './types';

export const createClerkExpressWithAuth = (createOpts: CreateClerkExpressMiddlewareOptions) => {
  const { clerkClient, frontendApi = '', apiKey = '', publishableKey = '' } = createOpts;
  return (options: ClerkMiddlewareOptions = {}): MiddlewareWithAuthProp => {
    return async (req, res, next) => {
      const requestState = await authenticateRequest(clerkClient, apiKey, frontendApi, publishableKey, req, options);
      if (requestState.isInterstitial) {
        const interstitial = await clerkClient.remotePrivateInterstitial();
        return handleInterstitialCase(res, requestState, interstitial);
      }
      (req as WithAuthProp<any>).auth = {
        ...requestState.toAuth(),
        claims: requestState.toAuth().sessionClaims,
      };
      next();
    };
  };
};
