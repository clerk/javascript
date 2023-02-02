import type { Request, Response } from 'express';
import type { IncomingMessage, ServerResponse } from 'http';

import { API_URL, clerkClient, PUBLISHABLE_KEY } from './clerkClient';
import { createClerkExpressWithAuth } from './clerkExpressWithAuth';
import type { ClerkMiddlewareOptions, WithAuthProp } from './types';
import { runMiddleware } from './utils';

type ApiHandlerWithAuth<TRequest, TResponse> = (req: WithAuthProp<TRequest>, res: TResponse) => void | Promise<void>;

// TODO: drop the Request/Response default values in v5 version
export function withAuth<TRequest = Request, TResponse = Response>(
  handler: ApiHandlerWithAuth<TRequest, TResponse>,
  options?: ClerkMiddlewareOptions,
): any {
  return async (req: TRequest, res: TResponse) => {
    await runMiddleware(
      req as IncomingMessage,
      res as ServerResponse,
      createClerkExpressWithAuth({
        clerkClient,
        apiUrl: API_URL,
        publishableKey: PUBLISHABLE_KEY,
      })(options),
    );

    return handler(req as WithAuthProp<TRequest>, res);
  };
}
