import type { ClerkClient } from '@clerk/backend';
import type { GetAuthFnNoRequest } from '@clerk/backend/internal';
import type { ShouldProxyFn } from '@clerk/shared/proxy';

/**
 * Variables that clerkMiddleware sets on the Hono context.
 * Access via c.get('clerk') and c.get('clerkAuth').
 */
export type ClerkHonoVariables = {
  clerk: ClerkClient;
  clerkAuth: GetAuthFnNoRequest;
};

/**
 * Options for the built-in Frontend API proxy.
 *
 * When enabled, the middleware intercepts requests that match the proxy path
 * (default `/__clerk`) and forwards them to the Clerk Frontend API, allowing
 * the Clerk frontend SDKs to communicate with Clerk without third-party
 * cookie or ad-blocker issues.
 */
export interface FrontendApiProxyOptions {
  /** Toggle the proxy on/off, or supply a function that decides per-request. */
  enabled: boolean | ShouldProxyFn;
  /** Custom path prefix for the proxy (default: `/__clerk`). */
  path?: string;
}
