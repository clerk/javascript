import type { ClerkMiddlewareOptions, WithAuthProp } from '@clerk/clerk-sdk-node';
import { createClerkExpressWithAuth } from '@clerk/clerk-sdk-node';
import type { NextApiRequest, NextApiResponse } from 'next';

import { API_URL, clerkClient, FRONTEND_API, PUBLISHABLE_KEY } from '../server';
import { runMiddleware } from './utils';

type NextApiHandlerWithAuth<T = any> = (
  req: WithAuthProp<NextApiRequest>,
  res: NextApiResponse<T>,
) => void | Promise<void>;

export function withAuth(handler: NextApiHandlerWithAuth, options?: ClerkMiddlewareOptions): NextApiHandlerWithAuth {
  return async (req, res) => {
    await runMiddleware(
      req,
      res,
      createClerkExpressWithAuth({
        clerkClient,
        frontendApi: FRONTEND_API,
        apiUrl: API_URL,
        publishableKey: PUBLISHABLE_KEY,
      })(options),
    );

    return handler(req, res);
  };
}
