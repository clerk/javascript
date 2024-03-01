// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { createClerkClient } from '@clerk/backend';
import type { AuthenticateRequestOptions, AuthObject } from '@clerk/backend/internal';
import type { Request as ExpressRequest, RequestHandler } from 'express';

export type ExpressRequestWithAuth = ExpressRequest & { auth: AuthObject };

export type ClerkMiddlewareOptions = AuthenticateRequestOptions & { debug?: boolean };

/**
 * Middleware for Express that handles authentication and authorization with Clerk.
 * For more details, please refer to the docs: TODO(express): add documentation link here
 */
export interface ClerkMiddleware {
  /**
   * @example
   * app.use(clerkMiddleware((request, response, next) => { ... }, options));
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
