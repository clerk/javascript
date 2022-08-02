import { ClerkMiddlewareOptions, default as Clerk, WithAuthProp } from '@clerk/clerk-sdk-node';
import type { NextApiRequest, NextApiResponse } from 'next';

import { runMiddleware } from './utils';

type NextApiHandlerWithAuth<T = any> = (
  req: WithAuthProp<NextApiRequest>,
  res: NextApiResponse<T>,
) => void | Promise<void>;

// Set the session on the request and then call provided handler
export function withAuth(handler: NextApiHandlerWithAuth, options?: ClerkMiddlewareOptions): NextApiHandlerWithAuth {
  return async (req, res) => {
    await runMiddleware(req, res, Clerk.expressWithAuth(options));
    return handler(req, res);
  };
}
