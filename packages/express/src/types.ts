import type { AuthObject, createClerkClient } from '@clerk/backend';
import type { AuthenticateRequestOptions } from '@clerk/backend/internal';
import type { Request as ExpressRequest, RequestHandler } from 'express';

export type ExpressRequestWithAuth = ExpressRequest & { auth: AuthObject };

export type ClerkMiddlewareOptions = AuthenticateRequestOptions & {
  debug?: boolean;
  clerkClient?: ClerkClient;
};

/**
 * Middleware for Express that handles authentication and authorization with Clerk.
 * For more details, please refer to the docs: https://clerk.com/docs/references/express/overview?utm_source=github&utm_medium=expres
 */
export interface ClerkMiddleware {
  /**
   * @example
   * const handler = (request, response, next) => {
   *   ...;
   *   // if next is not called the request will be terminated or hung.
   *   return next();
   * }
   * app.use(clerkMiddleware(handler, options));
   */
  (handler: RequestHandler, options?: ClerkMiddlewareOptions): RequestHandler[];
  /**
   * @example
   * app.use(clerkMiddleware(options));
   *
   * @example
   * const clerkClient = createClerkClient({ ... });
   * app.use(clerkMiddleware({ clerkClient }));
   *
   * @example
   * app.use(clerkMiddleware());
   */
  (options?: ClerkMiddlewareOptions): RequestHandler[];
}

type ClerkClient = ReturnType<typeof createClerkClient>;
export type AuthenticateRequestParams = {
  clerkClient: ClerkClient;
  request: ExpressRequest;
  options?: ClerkMiddlewareOptions;
};
