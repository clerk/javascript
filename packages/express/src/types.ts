// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { createClerkClient } from '@clerk/backend';
import type { AuthenticateRequestOptions, AuthObject } from '@clerk/backend/internal';
import type { Request as ExpressRequest, RequestHandler } from 'express';

export type ExpressRequestWithAuth = ExpressRequest & { auth: AuthObject };

export type ClerkMiddlewareOptions = AuthenticateRequestOptions & { debug?: boolean };

/**
 * Middleware for Express that handles authentication and authorization with Clerk.
 * For more details, please refer to the docs: https://beta.clerk.com/docs/backend-requests/handling/express
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
