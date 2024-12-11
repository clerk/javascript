import { isTruthy } from '@clerk/shared/underscore';
import type { AppLoadContext } from 'react-router';

type CloudflareEnv = { env: Record<string, string> };

const hasCloudflareProxyContext = (context: any): context is { cloudflare: CloudflareEnv } => {
  return !!context?.cloudflare?.env;
};

const hasCloudflareContext = (context: any): context is CloudflareEnv => {
  return !!context?.env;
};

/**
 *
 * Utility function to get env variables across Node and Edge runtimes.
 *
 * @param name
 * @returns string
 */
export const getEnvVariable = (name: string, context: AppLoadContext | undefined): string => {
  // Node envs
  if (typeof process !== 'undefined' && process.env && typeof process.env[name] === 'string') {
    return process.env[name];
  }

  // @ts-expect-error - Vite specific
  if (typeof import.meta !== 'undefined' && import.meta.env && typeof import.meta.env[name] === 'string') {
    // @ts-expect-error - Vite specific
    return import.meta.env[name];
  }

  if (hasCloudflareProxyContext(context)) {
    return context.cloudflare.env[name] || '';
  }

  // Cloudflare
  if (hasCloudflareContext(context)) {
    return context.env[name] || '';
  }

  // Check whether the value exists in the context object directly
  if (context && typeof context[name] === 'string') {
    return context[name];
  }

  // Cloudflare workers
  try {
    return globalThis[name as keyof typeof globalThis];
  } catch (_) {
    // This will raise an error in Cloudflare Pages
  }

  return '';
};

export const getPublicEnvVariables = (context: AppLoadContext | undefined) => {
  return {
    publishableKey:
      getEnvVariable('VITE_CLERK_PUBLISHABLE_KEY', context) || getEnvVariable('CLERK_PUBLISHABLE_KEY', context),
    domain: getEnvVariable('VITE_CLERK_DOMAIN', context) || getEnvVariable('CLERK_DOMAIN', context),
    isSatellite:
      isTruthy(getEnvVariable('VITE_CLERK_IS_SATELLITE', context)) ||
      isTruthy(getEnvVariable('CLERK_IS_SATELLITE', context)),
    proxyUrl: getEnvVariable('VITE_CLERK_PROXY_URL', context) || getEnvVariable('CLERK_PROXY_URL', context),
    signInUrl: getEnvVariable('VITE_CLERK_SIGN_IN_URL', context) || getEnvVariable('CLERK_SIGN_IN_URL', context),
    signUpUrl: getEnvVariable('VITE_CLERK_SIGN_UP_URL', context) || getEnvVariable('CLERK_SIGN_UP_URL', context),
    clerkJsUrl: getEnvVariable('VITE_CLERK_JS_URL', context) || getEnvVariable('CLERK_JS', context),
    clerkJsVariant: (getEnvVariable('VITE_CLERK_JS_VARIANT', context) ||
      getEnvVariable('CLERK_JS_VARIANT', context)) as '' | 'headless' | undefined,
    clerkJsVersion: getEnvVariable('VITE_CLERK_JS_VERSION', context) || getEnvVariable('CLERK_JS_VERSION', context),
    telemetryDisabled:
      isTruthy(getEnvVariable('VITE_CLERK_TELEMETRY_DISABLED', context)) ||
      isTruthy(getEnvVariable('CLERK_TELEMETRY_DISABLED', context)),
    telemetryDebug:
      isTruthy(getEnvVariable('VITE_CLERK_TELEMETRY_DEBUG', context)) ||
      isTruthy(getEnvVariable('CLERK_TELEMETRY_DEBUG', context)),
    signInForceRedirectUrl:
      getEnvVariable('VITE_CLERK_SIGN_IN_FORCE_REDIRECT_URL', context) ||
      getEnvVariable('CLERK_SIGN_IN_FORCE_REDIRECT_URL', context),
    signUpForceRedirectUrl:
      getEnvVariable('VITE_CLERK_SIGN_UP_FORCE_REDIRECT_URL', context) ||
      getEnvVariable('CLERK_SIGN_UP_FORCE_REDIRECT_URL', context),
    signInFallbackRedirectUrl:
      getEnvVariable('VITE_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL', context) ||
      getEnvVariable('CLERK_SIGN_IN_FALLBACK_REDIRECT_URL', context),
    signUpFallbackRedirectUrl:
      getEnvVariable('VITE_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL', context) ||
      getEnvVariable('CLERK_SIGN_UP_FALLBACK_REDIRECT_URL', context),
    afterSignInUrl:
      getEnvVariable('VITE_CLERK_AFTER_SIGN_IN_URL', context) || getEnvVariable('CLERK_AFTER_SIGN_IN_URL', context),
    afterSignUpUrl:
      getEnvVariable('VITE_CLERK_AFTER_SIGN_UP_URL', context) || getEnvVariable('CLERK_AFTER_SIGN_UP_URL', context),
  };
};
