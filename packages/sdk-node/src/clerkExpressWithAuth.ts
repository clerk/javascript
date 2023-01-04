import { Clerk } from '@clerk/backend';

import { authenticateRequest, handleInterstitialCase } from './authenticateRequest';
import { API_KEY, API_URL, clerkClient } from './clerkClient';
import type { ClerkMiddlewareOptions, MiddlewareWithAuthProp, WithAuthProp } from './types';

export const createClerkExpressWithAuth = (createOpts: {
  clerkClient: ReturnType<typeof Clerk>;
  apiKey?: string;
  frontendApi?: string;
  apiUrl?: string;
}) => {
  const { clerkClient, apiUrl = '', frontendApi = '', apiKey = '' } = createOpts;
  return (options: ClerkMiddlewareOptions = {}): MiddlewareWithAuthProp => {
    return async (req, res, next) => {
      const requestState = await authenticateRequest(clerkClient, apiKey, frontendApi, req, options);
      if (requestState.isInterstitial) {
        const interstitial = await clerkClient.remotePublicInterstitial({ apiUrl, frontendApi });
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
