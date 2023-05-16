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
      const requestState = await authenticateRequest({
        clerkClient,
        apiKey,
        secretKey,
        frontendApi,
        publishableKey,
        req,
        options,
      });
      decorateResponseWithObservabilityHeaders(res, requestState);
      if (requestState.isUnknown) {
        return handleUnknownCase(res, requestState);
      }
      if (requestState.isInterstitial) {
        let interstitial;

        /**
         * This is a step for deprecating the usage of `remotePrivateInterstitial`
         * For the multi-domain feature and when frontendApi is set prefer the localInterstitial
         */
        if (requestState.publishableKey || requestState.frontendApi) {
          interstitial = clerkClient.localInterstitial({
            frontendApi: requestState.frontendApi,
            publishableKey: requestState.publishableKey,
            proxyUrl: requestState.proxyUrl,
            signInUrl: requestState.signInUrl,
            isSatellite: requestState.isSatellite,
            domain: requestState.domain,
          });
        } else {
          interstitial = await clerkClient.remotePrivateInterstitial();
        }

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
