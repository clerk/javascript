import { Clerk } from '@clerk/backend';

import { authenticateRequest, handleInterstitialCase } from './authenticateRequest';
import { API_KEY, API_URL, clerkClient } from './clerkClient';
import type { ClerkMiddlewareOptions, MiddlewareRequireAuthProp, RequireAuthProp } from './types';

export type CreateClerkExpressMiddlewareOptions = {
  clerkClient: ReturnType<typeof Clerk>;
  apiKey?: string;
  frontendApi?: string;
  publishableKey?: string;
  apiUrl?: string;
};

export const createClerkExpressRequireAuth = (createOpts: CreateClerkExpressMiddlewareOptions) => {
  const { clerkClient, apiUrl = '', frontendApi = '', apiKey = '', publishableKey = '' } = createOpts;
  return (options: ClerkMiddlewareOptions = {}): MiddlewareRequireAuthProp => {
    return async (req, res, next) => {
      const requestState = await authenticateRequest(clerkClient, apiKey, frontendApi, publishableKey, req, options);
      if (requestState.isInterstitial) {
        const interstitial = await clerkClient.remotePublicInterstitial({ apiUrl, frontendApi, publishableKey });
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

export const ClerkExpressRequireAuth = createClerkExpressRequireAuth({ clerkClient, apiUrl: API_URL, apiKey: API_KEY });
