import {
  DEFAULT_PROXY_PATH,
  LEGACY_DEV_INSTANCE_SUFFIXES,
  LOCAL_ENV_SUFFIXES,
  LOCAL_FAPI_URL,
  PROD_FAPI_URL,
  STAGING_ENV_SUFFIXES,
  STAGING_FAPI_URL,
} from '@clerk/shared/constants';
import { parsePublishableKey } from '@clerk/shared/keys';

export { DEFAULT_PROXY_PATH } from '@clerk/shared/constants';

/**
 * Options for the Frontend API proxy
 */
export interface FrontendApiProxyOptions {
  /**
   * The path prefix for proxy requests. Defaults to `/__clerk`.
   */
  proxyPath?: string;
  /**
   * The Clerk publishable key. Falls back to CLERK_PUBLISHABLE_KEY env var.
   */
  publishableKey?: string;
  /**
   * The Clerk secret key. Falls back to CLERK_SECRET_KEY env var.
   */
  secretKey?: string;
}

/**
 * Error codes for proxy errors
 */
export type ProxyErrorCode = 'proxy_configuration_error' | 'proxy_path_mismatch' | 'proxy_request_failed';

/**
 * Error response structure for proxy errors
 */
export interface ProxyError {
  code: ProxyErrorCode;
  message: string;
}

// Hop-by-hop headers that should not be forwarded
const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
]);

/**
 * Parses the Connection header to extract dynamically-nominated hop-by-hop
 * header names (RFC 7230 Section 6.1). These headers are specific to the
 * current connection and must not be forwarded by proxies.
 */
function getDynamicHopByHopHeaders(headers: Headers): Set<string> {
  const connectionValue = headers.get('connection');
  if (!connectionValue) {
    return new Set();
  }
  return new Set(
    connectionValue
      .split(',')
      .map(h => h.trim().toLowerCase())
      .filter(h => h.length > 0),
  );
}

// Headers to strip from proxied responses. fetch() auto-decompresses
// response bodies, so Content-Encoding no longer describes the body
// and Content-Length reflects the compressed size. We request identity
// encoding upstream to avoid the double compression pass, but strip
// these defensively since servers may ignore Accept-Encoding: identity.
const RESPONSE_HEADERS_TO_STRIP = ['content-encoding', 'content-length'];

/**
 * Derives the Frontend API URL from a publishable key.
 * @param publishableKey - The Clerk publishable key
 * @returns The Frontend API URL for the environment
 */
export function fapiUrlFromPublishableKey(publishableKey: string): string {
  const frontendApi = parsePublishableKey(publishableKey)?.frontendApi;

  if (frontendApi?.startsWith('clerk.') && LEGACY_DEV_INSTANCE_SUFFIXES.some(suffix => frontendApi?.endsWith(suffix))) {
    return PROD_FAPI_URL;
  }

  if (LOCAL_ENV_SUFFIXES.some(suffix => frontendApi?.endsWith(suffix))) {
    return LOCAL_FAPI_URL;
  }
  if (STAGING_ENV_SUFFIXES.some(suffix => frontendApi?.endsWith(suffix))) {
    return STAGING_FAPI_URL;
  }
  return PROD_FAPI_URL;
}

/**
 * Removes trailing slashes from a string without using regex
 * to avoid potential ReDoS concerns flagged by security scanners.
 */
export function stripTrailingSlashes(str: string): string {
  while (str.endsWith('/')) {
    str = str.slice(0, -1);
  }
  return str;
}

/**
 * Checks if a request path matches the proxy path.
 * @param request - The incoming request
 * @param options - Proxy options including the proxy path
 * @returns True if the request matches the proxy path
 */
export function matchProxyPath(request: Request, options?: Pick<FrontendApiProxyOptions, 'proxyPath'>): boolean {
  const proxyPath = stripTrailingSlashes(options?.proxyPath || DEFAULT_PROXY_PATH);
  const url = new URL(request.url);
  return url.pathname === proxyPath || url.pathname.startsWith(proxyPath + '/');
}

/**
 * Creates a JSON error response
 */
function createErrorResponse(code: ProxyErrorCode, message: string, status: number): Response {
  const error: ProxyError = { code, message };
  return new Response(JSON.stringify({ errors: [error] }), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    },
  });
}

/**
 * Derives the public-facing origin from forwarded headers, falling back to the raw request URL.
 * Behind a reverse proxy, request.url is typically localhost, but the Clerk-Proxy-Url header
 * and Location rewrites must use the origin visible to the browser.
 */
function derivePublicOrigin(request: Request, requestUrl: URL): string {
  const forwardedProto = request.headers.get('x-forwarded-proto')?.split(',')[0]?.trim();
  const forwardedHost = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim();

  if (forwardedProto && forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  return requestUrl.origin;
}

/**
 * Gets the client IP address from various headers
 */
function getClientIp(request: Request): string | undefined {
  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  const xRealIp = request.headers.get('x-real-ip');
  if (xRealIp) {
    return xRealIp;
  }

  const xForwardedFor = request.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    // Take the first IP in the chain
    return xForwardedFor.split(',')[0]?.trim();
  }

  return undefined;
}

/**
 * Proxies a request to Clerk's Frontend API.
 *
 * This function handles forwarding requests from your application to Clerk's
 * Frontend API, enabling scenarios where direct communication with Clerk's API
 * is blocked or needs to go through your application server.
 *
 * @param request - The incoming request to proxy
 * @param options - Proxy configuration options
 * @returns A Response from Clerk's Frontend API
 *
 * @example
 * ```typescript
 * import { clerkFrontendApiProxy } from '@clerk/backend/proxy';
 *
 * // In a route handler
 * const response = await clerkFrontendApiProxy(request, {
 *   proxyPath: '/__clerk',
 *   publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
 *   secretKey: process.env.CLERK_SECRET_KEY,
 * });
 * ```
 */
export async function clerkFrontendApiProxy(request: Request, options?: FrontendApiProxyOptions): Promise<Response> {
  const proxyPath = stripTrailingSlashes(options?.proxyPath || DEFAULT_PROXY_PATH);
  const publishableKey =
    options?.publishableKey || (typeof process !== 'undefined' ? process.env?.CLERK_PUBLISHABLE_KEY : undefined);
  const secretKey = options?.secretKey || (typeof process !== 'undefined' ? process.env?.CLERK_SECRET_KEY : undefined);

  // Validate configuration
  if (!publishableKey) {
    return createErrorResponse(
      'proxy_configuration_error',
      'Missing publishableKey. Provide it in options or set CLERK_PUBLISHABLE_KEY environment variable.',
      500,
    );
  }

  if (!secretKey) {
    return createErrorResponse(
      'proxy_configuration_error',
      'Missing secretKey. Provide it in options or set CLERK_SECRET_KEY environment variable.',
      500,
    );
  }

  // Get the request URL and validate path
  const requestUrl = new URL(request.url);
  const pathMatches = requestUrl.pathname === proxyPath || requestUrl.pathname.startsWith(proxyPath + '/');
  if (!pathMatches) {
    return createErrorResponse(
      'proxy_path_mismatch',
      `Request path "${requestUrl.pathname}" does not match proxy path "${proxyPath}"`,
      400,
    );
  }

  // Derive the FAPI URL and construct the target URL.
  // Use string concatenation instead of `new URL(path, base)` to avoid
  // protocol-relative resolution (e.g., "//evil.com" resolving to a different host).
  const fapiBaseUrl = fapiUrlFromPublishableKey(publishableKey);
  const fapiHost = new URL(fapiBaseUrl).host;
  const targetPath = requestUrl.pathname.slice(proxyPath.length) || '/';
  const targetUrl = new URL(`${fapiBaseUrl}${targetPath}`);
  targetUrl.search = requestUrl.search;

  if (targetUrl.host !== fapiHost) {
    return createErrorResponse('proxy_request_failed', 'Resolved target does not match the expected host', 400);
  }

  // Build headers for the proxied request
  const headers = new Headers();

  // Copy original headers, excluding hop-by-hop headers and any
  // dynamically-nominated hop-by-hop headers listed in the Connection header (RFC 7230 Section 6.1).
  const dynamicHopByHop = getDynamicHopByHopHeaders(request.headers);
  request.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (!HOP_BY_HOP_HEADERS.has(lower) && !dynamicHopByHop.has(lower)) {
      headers.set(key, value);
    }
  });

  // Set required Clerk proxy headers
  // Use the public origin (from forwarded headers) so the Clerk-Proxy-Url
  // points to the browser-visible host, not localhost behind a reverse proxy.
  const publicOrigin = derivePublicOrigin(request, requestUrl);
  const proxyUrl = `${publicOrigin}${proxyPath}`;
  headers.set('Clerk-Proxy-Url', proxyUrl);
  headers.set('Clerk-Secret-Key', secretKey);

  // Set the host header to the FAPI host
  headers.set('Host', fapiHost);

  // Request uncompressed responses to avoid a double compression pass.
  // fetch() auto-decompresses, so without this FAPI compresses → fetch
  // decompresses → the serving layer re-compresses for the browser.
  headers.set('Accept-Encoding', 'identity');

  // Set X-Forwarded-* headers for proxy awareness
  // Only set these if not already present (preserve values from upstream proxies)
  if (!headers.has('X-Forwarded-Host')) {
    headers.set('X-Forwarded-Host', requestUrl.host);
  }
  if (!headers.has('X-Forwarded-Proto')) {
    headers.set('X-Forwarded-Proto', requestUrl.protocol.replace(':', ''));
  }

  // Set X-Forwarded-For to the client IP
  // In multi-proxy scenarios, we prefer authoritative headers (CF-Connecting-IP, X-Real-IP)
  // over the existing X-Forwarded-For chain, as they provide the true client IP
  const clientIp = getClientIp(request);
  if (clientIp) {
    headers.set('X-Forwarded-For', clientIp);
  }

  // Determine if request has a body (handles DELETE-with-body and any other method)
  const hasBody = request.body !== null;

  try {
    // Make the proxied request
    // TODO: Consider adding AbortSignal.timeout(30_000) via AbortSignal.any()
    const fetchOptions: RequestInit = {
      method: request.method,
      headers,
      redirect: 'manual',
      signal: request.signal,
    };

    // Only set duplex when body is present (required for streaming bodies)
    if (hasBody) {
      // @ts-expect-error - duplex is required for streaming bodies, but not present on the RequestInit type from undici
      fetchOptions.duplex = 'half';
      fetchOptions.body = request.body;
    }

    const response = await fetch(targetUrl.toString(), fetchOptions);

    // Build response headers, excluding hop-by-hop and encoding headers.
    // Also strip dynamically-nominated hop-by-hop headers from the response Connection header.
    const responseDynamicHopByHop = getDynamicHopByHopHeaders(response.headers);
    const responseHeaders = new Headers();
    response.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (
        !HOP_BY_HOP_HEADERS.has(lower) &&
        !RESPONSE_HEADERS_TO_STRIP.includes(lower) &&
        !responseDynamicHopByHop.has(lower)
      ) {
        if (lower === 'set-cookie') {
          responseHeaders.append(key, value);
        } else {
          responseHeaders.set(key, value);
        }
      }
    });

    // Rewrite Location header for redirects to go through the proxy
    const locationHeader = response.headers.get('location');
    if (locationHeader) {
      try {
        const locationUrl = new URL(locationHeader, fapiBaseUrl);
        // Check if the redirect points to the FAPI host
        if (locationUrl.host === fapiHost) {
          // Rewrite to go through the proxy
          const rewrittenLocation = `${proxyUrl}${locationUrl.pathname}${locationUrl.search}${locationUrl.hash}`;
          responseHeaders.set('Location', rewrittenLocation);
        }
      } catch {
        // If URL parsing fails, leave the Location header as-is (could be a relative URL)
      }
    }

    const proxyResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });

    // Some runtimes may re-add Content-Length when constructing the Response.
    // Delete explicitly since fetch() decoded the body and the original values
    // no longer reflect the actual content.
    for (const header of RESPONSE_HEADERS_TO_STRIP) {
      proxyResponse.headers.delete(header);
    }

    return proxyResponse;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return createErrorResponse('proxy_request_failed', `Failed to proxy request to Clerk FAPI: ${message}`, 502);
  }
}
