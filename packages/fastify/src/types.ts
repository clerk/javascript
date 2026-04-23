import type { ClerkOptions } from '@clerk/backend';
import type { ShouldProxyFn } from '@clerk/shared/proxy';

export const ALLOWED_HOOKS = ['onRequest', 'preHandler'] as const;

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

export type ClerkFastifyOptions = ClerkOptions & {
  hookName?: (typeof ALLOWED_HOOKS)[number];
  frontendApiProxy?: FrontendApiProxyOptions;
};
