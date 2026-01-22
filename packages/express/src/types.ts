import type { createClerkClient } from '@clerk/backend';
import type { AuthenticateRequestOptions, SignedInAuthObject, SignedOutAuthObject } from '@clerk/backend/internal';
import type { PendingSessionOptions } from '@clerk/shared/types';
import type { Request as ExpressRequest } from 'express';

export type ExpressRequestWithAuth = ExpressRequest & {
  auth: (options?: PendingSessionOptions) => SignedInAuthObject | SignedOutAuthObject;
};

/**
 * Options for configuring Frontend API proxy in clerkMiddleware
 */
export interface FrontendApiProxyOptions {
  /**
   * Enable proxy path skipping. When true, requests to the proxy path will
   * bypass authentication to avoid redirect loops.
   *
   * @default true
   */
  enabled?: boolean;
  /**
   * The path prefix for proxy requests.
   *
   * @default '/__clerk'
   */
  path?: string;
}

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
  /**
   * Configure Frontend API proxy handling. When set, requests to the proxy path
   * will skip authentication, and the proxyUrl will be automatically derived
   * for handshake redirects.
   *
   * @example
   * // Use defaults (path: '/__clerk', enabled: true)
   * clerkMiddleware({ frontendApiProxy: {} })
   *
   * @example
   * // Custom path
   * clerkMiddleware({ frontendApiProxy: { path: '/my-proxy' } })
   *
   * @example
   * // Disable proxy handling
   * clerkMiddleware({ frontendApiProxy: { enabled: false } })
   */
  frontendApiProxy?: FrontendApiProxyOptions;
};

type ClerkClient = ReturnType<typeof createClerkClient>;
export type AuthenticateRequestParams = {
  clerkClient: ClerkClient;
  request: ExpressRequest;
  options?: ClerkMiddlewareOptions;
};
