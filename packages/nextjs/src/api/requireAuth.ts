import type { ClerkMiddlewareOptions, RequireAuthProp } from '@clerk/clerk-sdk-node';
import { createClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';
import type { NextApiHandler, NextApiRequest, NextApiResponse } from 'next';

import { API_URL, clerkClient, FRONTEND_API, PUBLISHABLE_KEY } from '../server';
import { runMiddleware } from './utils';

type NextApiHandlerRequireAuth<T = any> = (
  req: RequireAuthProp<NextApiRequest>,
  res: NextApiResponse<T>,
) => void | Promise<void>;

export function requireAuth(handler: NextApiHandlerRequireAuth, options?: ClerkMiddlewareOptions): NextApiHandler {
  return async (req, res) => {
    try {
      await runMiddleware(
        req,
        res,
        createClerkExpressRequireAuth({
          clerkClient,
          apiUrl: API_URL,
          frontendApi: FRONTEND_API,
          publishableKey: PUBLISHABLE_KEY,
        })(options),
      );
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
