import { ClerkMiddlewareOptions, createClerkExpressRequireAuth, WithAuthProp } from '@clerk/clerk-sdk-node';
import type { NextApiRequest, NextApiResponse } from 'next';

import { API_URL, clerkClient, FRONTEND_API } from '../server';
import { runMiddleware } from './utils';

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
    await runMiddleware(
      req,
      res,
      createClerkExpressRequireAuth({ clerkClient, frontendApi: FRONTEND_API, apiUrl: API_URL })(options),
    );

    return handler(req, res);
  };
}
