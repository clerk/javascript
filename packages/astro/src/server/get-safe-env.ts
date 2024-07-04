import type { APIContext } from 'astro';

type ContextOrLocals = APIContext | APIContext['locals'];

/**
 * @internal
 * Isomorphic handler for reading environemnt variables defined from Vite or are injected in the request context (CF Pages)
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
  return {
    domain: getContextEnvVar('PUBLIC_ASTRO_APP_CLERK_DOMAIN', context),
    isSatellite: getContextEnvVar('PUBLIC_ASTRO_APP_CLERK_IS_SATELLITE', context) === 'true',
    proxyUrl: getContextEnvVar('PUBLIC_ASTRO_APP_CLERK_PROXY_URL', context),
    pk: getContextEnvVar('PUBLIC_ASTRO_APP_CLERK_PUBLISHABLE_KEY', context),
    sk: getContextEnvVar('CLERK_SECRET_KEY', context),
    signInUrl: getContextEnvVar('PUBLIC_ASTRO_APP_CLERK_SIGN_IN_URL', context),
    signUpUrl: getContextEnvVar('PUBLIC_ASTRO_APP_CLERK_SIGN_UP_URL', context),
    clerkJsUrl: getContextEnvVar('PUBLIC_ASTRO_APP_CLERK_JS_URL', context),
    clerkJsVariant: getContextEnvVar('PUBLIC_ASTRO_APP_CLERK_JS_VARIANT', context) as 'headless' | '' | undefined,
    clerkJsVersion: getContextEnvVar('PUBLIC_ASTRO_APP_CLERK_JS_VERSION', context),
    apiVersion: getContextEnvVar('CLERK_API_VERSION', context),
    apiUrl: getContextEnvVar('CLERK_API_URL', context),
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
  return {
    domain: getContextEnvVar('PUBLIC_ASTRO_APP_CLERK_DOMAIN', context),
    isSatellite: getContextEnvVar('PUBLIC_ASTRO_APP_CLERK_IS_SATELLITE', context) === 'true',
    proxyUrl: getContextEnvVar('PUBLIC_ASTRO_APP_CLERK_PROXY_URL', context),
    signInUrl: getContextEnvVar('PUBLIC_ASTRO_APP_CLERK_SIGN_IN_URL', context),
    signUpUrl: getContextEnvVar('PUBLIC_ASTRO_APP_CLERK_SIGN_UP_URL', context),
  };
}

export { getSafeEnv, getClientSafeEnv };
