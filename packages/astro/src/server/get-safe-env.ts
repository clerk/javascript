import { isTruthy } from '@clerk/shared/underscore';
import type { APIContext } from 'astro';

type ContextOrLocals = APIContext | APIContext['locals'];

/**
 * Cached env object from `cloudflare:workers` for Astro v6+ Cloudflare adapter.
 * - `undefined`: not yet attempted
 * - `null`: attempted but not available (non-Cloudflare environment)
 * - object: the env object from `cloudflare:workers`
 */
let cloudflareEnv: Record<string, string> | null | undefined;

/**
 * @internal
 * Attempts to import env from `cloudflare:workers` and caches the result.
 * This is needed for Astro v6+ where `locals.runtime.env` is no longer available.
 * Safe to call in non-Cloudflare environments — will no-op.
 */
async function initCloudflareEnv(): Promise<void> {
  if (cloudflareEnv !== undefined) {
    return;
  }
  try {
    // Use a variable to prevent TypeScript from resolving the module specifier
    const moduleName = 'cloudflare:workers';
    const mod = await import(/* @vite-ignore */ moduleName);
    cloudflareEnv = mod.env;
  } catch {
    cloudflareEnv = null;
  }
}

/**
 * @internal
 * Isomorphic handler for reading environment variables defined from Vite or are injected in the request context (CF Pages)
 */
function getContextEnvVar(envVarName: keyof InternalEnv, contextOrLocals: ContextOrLocals): string | undefined {
  const locals = 'locals' in contextOrLocals ? contextOrLocals.locals : contextOrLocals;

  // Astro v4/v5 Cloudflare adapter: env is on locals.runtime.env
  try {
    if (locals?.runtime?.env) {
      return locals.runtime.env[envVarName];
    }
  } catch {
    // Astro v6 Cloudflare adapter throws when accessing locals.runtime.env
  }

  // Astro v6 Cloudflare adapter: env from cloudflare:workers
  if (cloudflareEnv) {
    return cloudflareEnv[envVarName];
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
    // Use keyless publishable key if available, otherwise read from env
    pk: locals.keylessPublishableKey || getContextEnvVar('PUBLIC_CLERK_PUBLISHABLE_KEY', context),
    sk: getContextEnvVar('CLERK_SECRET_KEY', context),
    machineSecretKey: getContextEnvVar('CLERK_MACHINE_SECRET_KEY', context),
    signInUrl: getContextEnvVar('PUBLIC_CLERK_SIGN_IN_URL', context),
    signUpUrl: getContextEnvVar('PUBLIC_CLERK_SIGN_UP_URL', context),
    clerkJsUrl: getContextEnvVar('PUBLIC_CLERK_JS_URL', context),
    clerkJsVersion: getContextEnvVar('PUBLIC_CLERK_JS_VERSION', context),
    clerkUIUrl: getContextEnvVar('PUBLIC_CLERK_UI_URL', context),
    clerkUIVersion: getContextEnvVar('PUBLIC_CLERK_UI_VERSION', context),
    prefetchUI: getContextEnvVar('PUBLIC_CLERK_PREFETCH_UI', context) === 'false' ? false : undefined,
    apiVersion: getContextEnvVar('CLERK_API_VERSION', context),
    apiUrl: getContextEnvVar('CLERK_API_URL', context),
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
    // In keyless mode, pass the resolved publishable key to client
    publishableKey: locals.keylessPublishableKey || getContextEnvVar('PUBLIC_CLERK_PUBLISHABLE_KEY', context),
    // Read from locals (set by middleware) instead of env vars
    keylessClaimUrl: locals.keylessClaimUrl,
    keylessApiKeysUrl: locals.keylessApiKeysUrl,
  };
}

export { getSafeEnv, getClientSafeEnv, initCloudflareEnv };
