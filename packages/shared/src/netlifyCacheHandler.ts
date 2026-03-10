/* eslint-disable turbo/no-undeclared-env-vars */
import { isDevelopmentFromPublishableKey } from './keys';

/**
 * Cache busting parameter for Netlify to prevent cached responses
 * during handshake flows with Clerk development instances.
 *
 * Note: This query parameter will be removed in the "@clerk/clerk-js" package.
 *
 * @internal
 */
export const CLERK_NETLIFY_CACHE_BUST_PARAM = '__clerk_netlify_cache_bust';

/**
 * Returns true if running in a Netlify environment.
 * Checks for Netlify-specific environment variables in process.env.
 * Safe for browser and non-Node environments.
 */
function isNetlifyRuntime(): boolean {
  if (typeof process === 'undefined' || !process.env) {
    return false;
  }

  return (
    Boolean(process.env.NETLIFY) ||
    Boolean(process.env.NETLIFY_FUNCTIONS_TOKEN) ||
    (typeof process.env.URL === 'string' && process.env.URL.endsWith('netlify.app'))
  );
}

/**
 * Applies Netlify-specific cache headers to the request state.
 *
 * When running on Netlify, this function:
 * 1. Sets `Netlify-Vary: cookie=__client_uat,cookie=__session` to instruct Netlify's CDN
 *    to create separate cache entries based on auth cookie values, preventing cached auth
 *    state from bleeding across users/sessions.
 * 2. For development instances with a redirect (Location header), adds a cache-bust query
 *    parameter to prevent Netlify from serving cached responses during the handshake flow.
 *
 * @internal
 */
export function handleNetlifyCacheHeaders(requestState: { headers: Headers; publishableKey: string }): void {
  if (!isNetlifyRuntime()) {
    return;
  }

  const { headers, publishableKey } = requestState;

  // Tell Netlify CDN to vary cache by auth cookie values (all instances, dev + prod)
  headers.set('Netlify-Vary', 'cookie=__client_uat,cookie=__session');

  // Add cache-bust param to redirect URL for dev instances to prevent cached redirects
  const locationHeader = headers.get('Location');
  if (locationHeader && isDevelopmentFromPublishableKey(publishableKey)) {
    const hasHandshakeQueryParam = locationHeader.includes('__clerk_handshake');
    if (!hasHandshakeQueryParam) {
      const url = new URL(locationHeader);
      url.searchParams.append(CLERK_NETLIFY_CACHE_BUST_PARAM, Date.now().toString());
      headers.set('Location', url.toString());
    }
  }
}

/**
 * @deprecated Use `handleNetlifyCacheHeaders` instead.
 * @internal
 */
export function handleNetlifyCacheInDevInstance({
  locationHeader: _locationHeader,
  requestStateHeaders,
  publishableKey,
}: {
  locationHeader: string;
  requestStateHeaders: Headers;
  publishableKey: string;
}) {
  handleNetlifyCacheHeaders({ headers: requestStateHeaders, publishableKey });
}
