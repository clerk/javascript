import type { Request, Response } from 'express';

import { clerkClient, loadApiEnv, loadClientEnv } from './clerkClient';
import { createClerkExpressWithAuth } from './clerkExpressWithAuth';
import type { ClerkMiddlewareOptions, WithAuthProp } from './types';
import { runMiddleware } from './utils';

type ApiHandlerWithAuth<TRequest, TResponse> = (req: WithAuthProp<TRequest>, res: TResponse) => void | Promise<void>;

// TODO: drop the Request/Response default values in v5 version
export function withAuth<TRequest extends Request = Request, TResponse extends Response = Response>(
  handler: ApiHandlerWithAuth<TRequest, TResponse>,
  options?: ClerkMiddlewareOptions,
): any {
  return async (req: TRequest, res: TResponse) => {
    const env = { ...loadApiEnv(), ...loadClientEnv() };
    await runMiddleware(req, res, createClerkExpressWithAuth({ clerkClient, ...env })(options));

    return handler(req as WithAuthProp<TRequest>, res);
  };
}
