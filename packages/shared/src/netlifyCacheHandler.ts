/* eslint-disable turbo/no-undeclared-env-vars */
import { isDevelopmentFromPublishableKey } from './keys';

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
 * Prevents infinite redirects in Netlify's CDN by setting Netlify-Vary headers
 * to vary cache based on authentication cookies. This ensures that Netlify serves
 * different cached responses based on the user's authentication state.
 *
 * The issue happens only on Clerk development instances running on Netlify.
 *
 * See https://answers.netlify.com/t/cache-handling-recommendation-for-authentication-handshake-redirects/143969/1.
 *
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
  const isOnNetlify = isNetlifyRuntime();
  const isDevelopmentInstance = isDevelopmentFromPublishableKey(publishableKey);

  if (isOnNetlify && isDevelopmentInstance) {
    // Set Netlify-Vary header to vary cache based on Clerk authentication cookies
    // This prevents Netlify from serving stale redirect responses during handshake flow
    requestStateHeaders.set('Netlify-Vary', 'cookie=__client, cookie=__session');
  }
}
