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
 * Options for configuring Frontend API proxy in clerkMiddleware
 */
export interface FrontendApiProxyOptions {
  /**
   * Enable proxy handling. Can be:
   * - `true` - enable for all domains
   * - `false` - disable for all domains
   * - A function: (url: URL) => boolean - enable based on the request URL
   */
  enabled: boolean | ShouldProxyFn;
  /**
   * The path prefix for proxy requests. Defaults to `/__clerk`.
   */
  path?: string;
}
