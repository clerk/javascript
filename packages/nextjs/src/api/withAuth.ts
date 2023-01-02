import { AuthObject } from '@clerk/backend';
import { ClerkAPIError } from '@clerk/types';
import type { NextApiRequest, NextApiResponse } from 'next';

import { authenticateRequest, handleInterstitialCase, LegacyAuthObject, runMiddleware } from './utils';

type WithAuthProp<T> = { auth: LegacyAuthObject<AuthObject> } & T;

type ClerkMiddlewareOptions = {
  onError?: (error: ClerkAPIError) => unknown;
  authorizedParties?: string[];
  jwtKey?: string;
};

type NextApiHandlerWithAuth<T = any> = (
  req: WithAuthProp<NextApiRequest>,
  res: NextApiResponse<T>,
) => void | Promise<void>;

/**
 * @deprecated The /api path is deprecated and will be removed in the next major release.
 * Use the exports from /server instead
 */

export function withAuth(handler: NextApiHandlerWithAuth, options?: ClerkMiddlewareOptions): NextApiHandlerWithAuth {
  return async (req, res) => {
    await runMiddleware(req, res, async (req, res, next) => {
      const requestState = await authenticateRequest(req, options);
      if (requestState.isInterstitial) {
        return handleInterstitialCase(res, requestState);
      }
      req.auth = { ...requestState.toAuth, claims: requestState.toAuth().sessionClaims };
      return next();
    });

    return handler(req, res);
  };
}
