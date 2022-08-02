import { ClerkMiddlewareOptions, default as Clerk, RequireAuthProp } from '@clerk/clerk-sdk-node';
import type { NextApiRequest, NextApiResponse } from 'next';

import { runMiddleware } from './utils';

type NextApiHandlerRequireAuth<T = any> = (
  req: RequireAuthProp<NextApiRequest>,
  res: NextApiResponse<T>,
) => void | Promise<void>;

export function requireAuth(
  handler: NextApiHandlerRequireAuth,
  options?: ClerkMiddlewareOptions,
): NextApiHandlerRequireAuth {
  return async (req, res) => {
    try {
      await runMiddleware(req, res, Clerk.expressRequireAuth(options));
      return handler(req, res);
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
