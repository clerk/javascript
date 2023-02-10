import {
  authenticateRequest,
  decorateResponseWithObservabilityHeaders,
  handleInterstitialCase,
  handleUnknownCase,
} from './authenticateRequest';
import type { CreateClerkExpressMiddlewareOptions } from './clerkExpressRequireAuth';
import type { ClerkMiddlewareOptions, MiddlewareWithAuthProp, WithAuthProp } from './types';

export const createClerkExpressWithAuth = (createOpts: CreateClerkExpressMiddlewareOptions) => {
  const { clerkClient, frontendApi = '', apiKey = '', secretKey = '', publishableKey = '' } = createOpts;
  return (options: ClerkMiddlewareOptions = {}): MiddlewareWithAuthProp => {
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

      (req as WithAuthProp<any>).auth = {
        ...requestState.toAuth(),
        claims: requestState.toAuth().sessionClaims,
      };
      next();
    };
  };
};
