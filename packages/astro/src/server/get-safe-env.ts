import { isTruthy } from '@clerk/shared/underscore';
import type { APIContext } from 'astro';

type ContextOrLocals = APIContext | APIContext['locals'];

/**
 * @internal
 * Isomorphic handler for reading environment variables defined from Vite or are injected in the request context (CF Pages)
 */
function getContextEnvVar(envVarName: keyof InternalEnv, contextOrLocals: ContextOrLocals): string | undefined {
  const locals = 'locals' in contextOrLocals ? contextOrLocals.locals : contextOrLocals;

  if (locals?.runtime?.env) {
    return locals.runtime.env[envVarName];
  }

  return import.meta.env[envVarName];
}

/**
 * @internal
 */
function getSafeEnv(context: ContextOrLocals) {
  const locals = 'locals' in context ? context.locals : context;

  return {
    domain: getContextEnvVar('PUBLIC_CLERK_DOMAIN', context),
    isSatellite: getContextEnvVar('PUBLIC_CLERK_IS_SATELLITE', context) === 'true',
    proxyUrl: getContextEnvVar('PUBLIC_CLERK_PROXY_URL', context),
    pk: getContextEnvVar('PUBLIC_CLERK_PUBLISHABLE_KEY', context),
    sk: getContextEnvVar('CLERK_SECRET_KEY', context),
    machineSecretKey: getContextEnvVar('CLERK_MACHINE_SECRET_KEY', context),
    signInUrl: getContextEnvVar('PUBLIC_CLERK_SIGN_IN_URL', context),
    signUpUrl: getContextEnvVar('PUBLIC_CLERK_SIGN_UP_URL', context),
    clerkJsUrl: getContextEnvVar('PUBLIC_CLERK_JS_URL', context),
    clerkJsVersion: getContextEnvVar('PUBLIC_CLERK_JS_VERSION', context),
    clerkUIUrl: getContextEnvVar('PUBLIC_CLERK_UI_URL', context),
    prefetchUI: getContextEnvVar('PUBLIC_CLERK_PREFETCH_UI', context) === 'false' ? false : undefined,
    apiVersion: getContextEnvVar('CLERK_API_VERSION', context),
    apiUrl: getContextEnvVar('PUBLIC_CLERK_API_URL', context),
    telemetryDisabled: isTruthy(getContextEnvVar('PUBLIC_CLERK_TELEMETRY_DISABLED', context)),
    telemetryDebug: isTruthy(getContextEnvVar('PUBLIC_CLERK_TELEMETRY_DEBUG', context)),
    // Read from locals (set by middleware) instead of env vars
    keylessClaimUrl: locals.keylessClaimUrl,
    keylessApiKeysUrl: locals.keylessApiKeysUrl,
  };
}

/**
 * @internal
 * This should be used in order to pass environment variables from the server safely to the client.
 * When running an application with `wrangler pages dev` client side environment variables are not attached to `import.meta.env.*`
 * This is not the case when deploying to cloudflare pages directly
 * This is a way to get around it.
 */
function getClientSafeEnv(context: ContextOrLocals) {
  const locals = 'locals' in context ? context.locals : context;

  return {
    domain: getContextEnvVar('PUBLIC_CLERK_DOMAIN', context),
    isSatellite: getContextEnvVar('PUBLIC_CLERK_IS_SATELLITE', context) === 'true',
    proxyUrl: getContextEnvVar('PUBLIC_CLERK_PROXY_URL', context),
    signInUrl: getContextEnvVar('PUBLIC_CLERK_SIGN_IN_URL', context),
    signUpUrl: getContextEnvVar('PUBLIC_CLERK_SIGN_UP_URL', context),
    // Read from locals (set by middleware) instead of env vars
    keylessClaimUrl: locals.keylessClaimUrl,
    keylessApiKeysUrl: locals.keylessApiKeysUrl,
  };
}

export { getSafeEnv, getClientSafeEnv };
