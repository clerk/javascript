import { Request, Response } from 'express';

import { API_URL, clerkClient, PUBLISHABLE_KEY } from './clerkClient';
import { createClerkExpressWithAuth } from './clerkExpressWithAuth';
import { ClerkMiddlewareOptions, WithAuthProp } from './types';
import { runMiddleware } from './utils';

type ExpressApiHandlerWithAuth<T = any> = (req: WithAuthProp<Request>, res: Response<T>) => void | Promise<void>;

export function withAuth(handler: ExpressApiHandlerWithAuth, options?: ClerkMiddlewareOptions): any {
  return async (req: Request, res: Response) => {
    await runMiddleware(
      req,
      res,
      createClerkExpressWithAuth({
        clerkClient,
        apiUrl: API_URL,
        publishableKey: PUBLISHABLE_KEY,
      })(options),
    );

    return handler(req as WithAuthProp<Request>, res);
  };
}
