import {
  authenticateRequest,
  decorateResponseWithObservabilityHeaders,
  handleInterstitialCase,
  handleUnknownCase,
  loadInterstitial,
} from './authenticateRequest';
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
      if (requestState.isUnknown) {
        return handleUnknownCase(res, requestState);
      }
      if (requestState.isInterstitial) {
        const interstitial = await loadInterstitial({
          clerkClient,
          requestState,
        });
        if (interstitial.errors) {
          // Temporarily return Unauthenticated instead of the interstitial errors since we don't
          // want to expose any internal error (possible errors are http 401, 500 response from BAPI)
          // It will be dropped with the removal of fetching remotePrivateInterstitial
          next(new Error('Unauthenticated'));
          return;
        }
        return handleInterstitialCase(res, requestState, interstitial.data);
      }

      (req as WithAuthProp<any>).auth = {
        ...requestState.toAuth(),
        claims: requestState.toAuth().sessionClaims,
      };
      next();
    };
  };
};
