import type { ClerkClient, ClerkOptions } from '@clerk/backend';
import type { ShouldProxyFn } from '@clerk/shared/proxy';

declare module 'fastify' {
  interface FastifyRequest {
    clerk: ClerkClient;
  }
}

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
  /**
   * Whether to enable the handshake flow for session verification.
   *
   * When set to `false`, handshake cookies and query params are ignored on requests that
   * cannot complete a handshake redirect (non-GET requests and `fetch`/XHR calls), and
   * handshake redirects are skipped (except dev-browser handshakes, which development
   * instances require). Intended for pure API backends (e.g. a SPA calling a Fastify
   * server) where the server cannot deliver `Set-Cookie` headers back to the browser,
   * so stale handshake nonces would otherwise be replayed and trigger repeated `404`
   * errors from the Frontend API.
   *
   * @internal
   * @default true
   */
  __internal_enableHandshake?: boolean;
};
