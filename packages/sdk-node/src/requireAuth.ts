import type { Request, Response } from 'express';

import { clerkClient } from './clerkClient';
import { createClerkExpressRequireAuth } from './clerkExpressRequireAuth';
import type { ClerkMiddlewareOptions, RequireAuthProp } from './types';
import { runMiddleware } from './utils';

type ExpressApiHandlerRequireAuth<T = any> = (req: RequireAuthProp<Request>, res: Response<T>) => void | Promise<void>;

export function requireAuth(handler: ExpressApiHandlerRequireAuth, options?: ClerkMiddlewareOptions): any {
  return async (req: Request, res: Response) => {
    await runMiddleware(req, res, createClerkExpressRequireAuth({ clerkClient })(options));

    return handler(req as RequireAuthProp<Request>, res);
  };
}
