import { isTruthy } from '@clerk/shared/underscore';

import type { AstroClerkIntegrationParams } from '../types';

/**
 * Merges `prefetchUI` param with env vars.
 * - If param `prefetchUI` is explicitly `false`, return `false`
 * - If env `PUBLIC_CLERK_PREFETCH_UI` is "false", return `false`
 * - Otherwise return `undefined` (default behavior: prefetch UI)
 */
function mergePrefetchUIConfig(paramPrefetchUI: AstroClerkIntegrationParams['prefetchUI']): boolean | undefined {
  // Explicit false from param takes precedence
  if (paramPrefetchUI === false) {
    return false;
  }

  // Check env var
  if (import.meta.env.PUBLIC_CLERK_PREFETCH_UI === 'false') {
    return false;
  }

  return undefined;
}

/**
 * @internal
 */
const mergeEnvVarsWithParams = (params?: AstroClerkIntegrationParams & { publishableKey?: string }) => {
  const {
    signInUrl: paramSignIn,
    signUpUrl: paramSignUp,
    isSatellite: paramSatellite,
    proxyUrl: paramProxy,
    domain: paramDomain,
    publishableKey: paramPublishableKey,
    telemetry: paramTelemetry,
    clerkJSUrl: paramClerkJSUrl,
    clerkJSVersion: paramClerkJSVersion,
    clerkUIUrl: paramClerkUiUrl,
    prefetchUI: paramPrefetchUI,
    ...rest
  } = params || {};

  return {
    signInUrl: paramSignIn || import.meta.env.PUBLIC_CLERK_SIGN_IN_URL,
    signUpUrl: paramSignUp || import.meta.env.PUBLIC_CLERK_SIGN_UP_URL,
    isSatellite: paramSatellite || import.meta.env.PUBLIC_CLERK_IS_SATELLITE,
    proxyUrl: paramProxy || import.meta.env.PUBLIC_CLERK_PROXY_URL,
    domain: paramDomain || import.meta.env.PUBLIC_CLERK_DOMAIN,
    publishableKey: paramPublishableKey || import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY || '',
    clerkJSUrl: paramClerkJSUrl || import.meta.env.PUBLIC_CLERK_JS_URL,
    clerkJSVersion: paramClerkJSVersion || import.meta.env.PUBLIC_CLERK_JS_VERSION,
    clerkUIUrl: paramClerkUiUrl || import.meta.env.PUBLIC_CLERK_UI_URL,
    prefetchUI: mergePrefetchUIConfig(paramPrefetchUI),
    telemetry: paramTelemetry || {
      disabled: isTruthy(import.meta.env.PUBLIC_CLERK_TELEMETRY_DISABLED),
      debug: isTruthy(import.meta.env.PUBLIC_CLERK_TELEMETRY_DEBUG),
    },
    // Read from params (server-injected via __CLERK_ASTRO_SAFE_VARS__)
    // These are dynamically resolved by middleware, not from env vars
    __internal_keylessClaimUrl: (params as any)?.keylessClaimUrl,
    __internal_keylessApiKeysUrl: (params as any)?.keylessApiKeysUrl,
    ...rest,
  };
};

export { mergeEnvVarsWithParams };
