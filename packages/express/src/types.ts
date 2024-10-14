import type { AuthObject, createClerkClient } from '@clerk/backend';
import type { AuthenticateRequestOptions } from '@clerk/backend/internal';
import type { Request as ExpressRequest } from 'express';

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
   *
   * @default true
   */
  enableHandshake?: boolean;
};

type ClerkClient = ReturnType<typeof createClerkClient>;
export type AuthenticateRequestParams = {
  clerkClient: ClerkClient;
  request: ExpressRequest;
  options?: ClerkMiddlewareOptions;
};
