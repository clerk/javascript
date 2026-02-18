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
    Boolean(process.env.NETLIFY_DEV) ||
    Boolean(process.env.DEPLOY_PRIME_URL) ||
    Boolean(process.env.NETLIFY_FUNCTIONS_TOKEN) ||
    (typeof process.env.URL === 'string' && process.env.URL.endsWith('netlify.app'))
  );
}

/**
 * Prevents infinite redirects in Netlify's functions by adding a cache bust parameter
 * to the original redirect URL. This ensures that Netlify doesn't serve a cached response
 * during the handshake flow.
 *
 * The issue happens only on Clerk development instances running on Netlify. This is
 * a workaround until we find a better solution.
 *
 * See https://answers.netlify.com/t/cache-handling-recommendation-for-authentication-handshake-redirects/143969/1.
 *
 * @internal
 */
export function handleNetlifyCacheInDevInstance({
  locationHeader,
  requestStateHeaders,
  publishableKey,
}: {
  locationHeader: string;
  requestStateHeaders: Headers;
  publishableKey: string;
}) {
  const isOnNetlify = isNetlifyRuntime();
  const isDevelopmentInstance = isDevelopmentFromPublishableKey(publishableKey);

  if (isOnNetlify && isDevelopmentInstance) {
    const hasHandshakeQueryParam = locationHeader.includes('__clerk_handshake');
    // If location header is the original URL before the handshake flow, add cache bust param
    // The param should be removed in clerk-js
    if (!hasHandshakeQueryParam) {
      const url = new URL(locationHeader);
      url.searchParams.append(CLERK_NETLIFY_CACHE_BUST_PARAM, Date.now().toString());
      requestStateHeaders.set('Location', url.toString());
    }
  }
}
