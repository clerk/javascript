import type { ClerkOptions } from '@clerk/backend';
import type { ShouldProxyFn } from '@clerk/shared/proxy';

export const ALLOWED_HOOKS = ['onRequest', 'preHandler'] as const;

/**
 * Options for configuring Frontend API proxy in clerkPlugin
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
   * The path prefix for proxy requests.
   *
   * @default '/__clerk'
   */
  path?: string;
}

export type ClerkFastifyOptions = ClerkOptions & {
  hookName?: (typeof ALLOWED_HOOKS)[number];
  /**
   * Configure Frontend API proxy handling. When set, requests to the proxy path
   * will skip authentication, and the proxyUrl will be automatically derived
   * for handshake redirects.
   *
   * @example
   * // Enable with defaults (path: '/__clerk')
   * clerkPlugin({ frontendApiProxy: { enabled: true } })
   *
   * @example
   * // Custom path
   * clerkPlugin({ frontendApiProxy: { enabled: true, path: '/my-proxy' } })
   *
   * @example
   * // Disable proxy handling
   * clerkPlugin({ frontendApiProxy: { enabled: false } })
   */
  frontendApiProxy?: FrontendApiProxyOptions;
};
