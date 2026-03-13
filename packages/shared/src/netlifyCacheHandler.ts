/* eslint-disable turbo/no-undeclared-env-vars */
import { getCookieSuffix, isDevelopmentFromPublishableKey } from './keys';

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
 * 1. Sets `Netlify-Vary` with both unsuffixed and suffixed Clerk cookie names to instruct
 *    Netlify's CDN to create separate cache entries based on auth cookie values, preventing
 *    cached auth state from bleeding across users/sessions.
 * 2. For development instances with a redirect (Location header), adds a cache-bust query
 *    parameter to prevent Netlify from serving cached responses during the handshake flow.
 *
 * @internal
 */
export async function handleNetlifyCacheHeaders(requestState: {
  headers: Headers;
  publishableKey: string;
}): Promise<void> {
  if (!isNetlifyRuntime()) {
    return;
  }

  const { headers, publishableKey } = requestState;

  // Tell Netlify CDN to vary cache by auth cookie values (all instances, dev + prod).
  // Include both unsuffixed and suffixed cookie names since Clerk uses suffixed cookies
  // by default for newer instances (e.g. __client_uat_AbC12345).
  const cookieNames = ['__client_uat', '__session'];
  if (publishableKey) {
    const suffix = await getCookieSuffix(publishableKey);
    cookieNames.push(`__client_uat_${suffix}`, `__session_${suffix}`);
  }
  headers.set('Netlify-Vary', cookieNames.map(name => `cookie=${name}`).join(','));

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
export async function handleNetlifyCacheInDevInstance({
  locationHeader: _locationHeader,
  requestStateHeaders,
  publishableKey,
}: {
  locationHeader: string;
  requestStateHeaders: Headers;
  publishableKey: string;
}) {
  await handleNetlifyCacheHeaders({ headers: requestStateHeaders, publishableKey });
}
