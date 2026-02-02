import {
  clerkFrontendApiProxy as backendProxy,
  DEFAULT_PROXY_PATH,
  type FrontendApiProxyOptions,
} from '@clerk/backend/proxy';

import { PUBLISHABLE_KEY, SECRET_KEY } from './server/constants';

export { DEFAULT_PROXY_PATH, type FrontendApiProxyOptions } from '@clerk/backend/proxy';

/**
 * Options for the Next.js Frontend API proxy
 */
export interface NextFrontendApiProxyOptions extends Omit<FrontendApiProxyOptions, 'proxyPath'> {
  /**
   * The path prefix for proxy requests. For App Router route handlers,
   * this is typically derived from the route path.
   */
  proxyPath?: string;
}

/**
 * Proxies a request to Clerk's Frontend API in Next.js App Router.
 *
 * This function handles forwarding requests from your application to Clerk's
 * Frontend API, enabling scenarios where direct communication with Clerk's API
 * is blocked or needs to go through your application server.
 *
 * @param request - The incoming Next.js request
 * @param options - Proxy configuration options
 * @returns A Response from Clerk's Frontend API
 *
 * @example
 * ```typescript
 * // app/api/__clerk/[[...path]]/route.ts
 * import { clerkFrontendApiProxy } from '@clerk/nextjs/server';
 *
 * export async function GET(request: Request) {
 *   return clerkFrontendApiProxy(request);
 * }
 *
 * export async function POST(request: Request) {
 *   return clerkFrontendApiProxy(request);
 * }
 * ```
 */
export async function clerkFrontendApiProxy(
  request: Request,
  options?: NextFrontendApiProxyOptions,
): Promise<Response> {
  return backendProxy(request, {
    proxyPath: options?.proxyPath || DEFAULT_PROXY_PATH,
    publishableKey: options?.publishableKey || PUBLISHABLE_KEY,
    secretKey: options?.secretKey || SECRET_KEY,
  });
}

/**
 * Route handler type for Next.js App Router
 */
type RouteHandler = (request: Request) => Promise<Response>;

/**
 * Collection of route handlers for all HTTP methods
 */
export interface FrontendApiProxyHandlers {
  GET: RouteHandler;
  POST: RouteHandler;
  PUT: RouteHandler;
  DELETE: RouteHandler;
  PATCH: RouteHandler;
}

/**
 * Creates route handlers for proxying Clerk Frontend API requests.
 *
 * This function returns an object with handlers for GET, POST, PUT, DELETE, and PATCH
 * methods that can be directly exported from a Next.js App Router route file.
 *
 * @param options - Proxy configuration options
 * @returns An object with route handlers for all HTTP methods
 *
 * @example
 * ```typescript
 * // app/api/__clerk/[[...path]]/route.ts
 * import { createFrontendApiProxyHandlers } from '@clerk/nextjs/server';
 *
 * export const { GET, POST, PUT, DELETE, PATCH } = createFrontendApiProxyHandlers();
 * ```
 *
 * @example
 * ```typescript
 * // With custom options
 * export const { GET, POST, PUT, DELETE, PATCH } = createFrontendApiProxyHandlers({
 *   publishableKey: 'pk_...',
 *   secretKey: 'sk_...',
 * });
 * ```
 */
export function createFrontendApiProxyHandlers(options?: NextFrontendApiProxyOptions): FrontendApiProxyHandlers {
  const handler: RouteHandler = async (request: Request) => {
    return clerkFrontendApiProxy(request, options);
  };

  return {
    GET: handler,
    POST: handler,
    PUT: handler,
    DELETE: handler,
    PATCH: handler,
  };
}
