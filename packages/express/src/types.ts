import type { createClerkClient } from '@clerk/backend';
import type { AuthenticateRequestOptions, SignedInAuthObject, SignedOutAuthObject } from '@clerk/backend/internal';
import type { PendingSessionOptions } from '@clerk/types';
import type { Request as ExpressRequest } from 'express';

export type ExpressRequestWithAuth = ExpressRequest & {
  auth: (options?: PendingSessionOptions) => SignedInAuthObject | SignedOutAuthObject;
};

export type ClerkMiddlewareOptions = AuthenticateRequestOptions & {
  debug?: boolean;
  clerkClient?: ClerkClient;
  /**
   * @deprecated This option is deprecated as API requests don't trigger handshake flow.
   * Handshake is only relevant for server-rendered applications with page navigation,
   * not for API endpoints. This option will be removed in a future version.
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
