import { Request, Response } from 'express';

import { API_URL, clerkClient, PUBLISHABLE_KEY } from './clerkClient';
import { createClerkExpressRequireAuth } from './clerkExpressRequireAuth';
import { ClerkMiddlewareOptions, RequireAuthProp } from './types';
import { runMiddleware } from './utils';

type ExpressApiHandlerRequireAuth<T = any> = (req: RequireAuthProp<Request>, res: Response<T>) => void | Promise<void>;

export function requireAuth(handler: ExpressApiHandlerRequireAuth, options?: ClerkMiddlewareOptions): any {
  return async (req: Request, res: Response) => {
    await runMiddleware(
      req,
      res,
      createClerkExpressRequireAuth({
        clerkClient,
        apiUrl: API_URL,
        publishableKey: PUBLISHABLE_KEY,
      })(options),
    );

    return handler(req as RequireAuthProp<Request>, res);
  };
}
