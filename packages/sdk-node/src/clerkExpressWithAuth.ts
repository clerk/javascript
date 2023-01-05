import { authenticateRequest, handleInterstitialCase } from './authenticateRequest';
import { API_KEY, API_URL, clerkClient } from './clerkClient';
import { CreateClerkExpressMiddlewareOptions } from './clerkExpressRequireAuth';
import type { ClerkMiddlewareOptions, MiddlewareWithAuthProp, WithAuthProp } from './types';

export const createClerkExpressWithAuth = (createOpts: CreateClerkExpressMiddlewareOptions) => {
  const { clerkClient, apiUrl = '', frontendApi = '', apiKey = '', publishableKey = '' } = createOpts;
  return (options: ClerkMiddlewareOptions = {}): MiddlewareWithAuthProp => {
    return async (req, res, next) => {
      const requestState = await authenticateRequest(clerkClient, apiKey, frontendApi, publishableKey, req, options);
      if (requestState.isInterstitial) {
        const interstitial = await clerkClient.remotePublicInterstitial({ apiUrl, frontendApi, publishableKey });
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

export const ClerkExpressWithAuth = createClerkExpressWithAuth({ clerkClient, apiUrl: API_URL, apiKey: API_KEY });
