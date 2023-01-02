import { SignedInAuthObject } from '@clerk/backend';
import { ClerkAPIError } from '@clerk/types';
import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

import { authenticateRequest, handleInterstitialCase, LegacyAuthObject, runMiddleware } from './utils';

type RequireAuthProp<T> = { auth: LegacyAuthObject<SignedInAuthObject> } & T;

type NextApiHandlerRequireAuth<T = any> = (
  req: RequireAuthProp<NextApiRequest>,
  res: NextApiResponse<T>,
) => void | Promise<void>;

type ClerkMiddlewareOptions = {
  onError?: (error: ClerkAPIError) => unknown;
  authorizedParties?: string[];
  jwtKey?: string;
};

/**
 * @deprecated The /api path is deprecated and will be removed in the next major release.
 * Use the exports from /server instead
 */
export function requireAuth(handler: NextApiHandlerRequireAuth, options?: ClerkMiddlewareOptions): NextApiHandler {
  return async (req, res) => {
    try {
      await runMiddleware(req, res, async (req, res, next) => {
        const requestState = await authenticateRequest(req, options);
        if (requestState.isInterstitial) {
          return handleInterstitialCase(res, requestState);
        }

        req.auth = { ...requestState.toAuth(), claims: requestState.toAuth().sessionClaims };
        return requestState.isSignedIn ? next() : next(new Error('Unauthenticated'));
      });

      return handler(req as RequireAuthProp<NextApiRequest>, res);
    } catch (error) {
      // @ts-ignore
      const errorData = error.data || { error: error.message };
      // @ts-ignore
      res.statusCode = error.statusCode || 401;
      /**
       * Res.json is available in express-like environments.
       * Res.send is available in express-like but also Fastify.
       */
      res.json ? res.json(errorData) : res.send(errorData);
      res.end();
    }
  };
}
