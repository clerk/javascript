import type { AuthObject, createClerkClient } from '@clerk/backend';
import type { AuthenticateRequestOptions } from '@clerk/backend/internal';
import type { Request as ExpressRequest, RequestHandler } from 'express';

export type ExpressRequestWithAuth = ExpressRequest & { auth: AuthObject };

export type ClerkMiddlewareOptions = AuthenticateRequestOptions & {
  debug?: boolean;
  clerkClient?: ClerkClient;
  /**
   * Enables Clerk's handshake flow, which helps verify the session state
   * when a session JWT has expired. It issues a 307 redirect to refresh
   * the session JWT if the user is still logged in.
   *
   * This is useful for server-rendered fullstack applications to handle
   * expired JWTs securely and maintain session continuity.
   */
  enableHandshake?: boolean;
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
