import { isTruthy } from '@clerk/shared/underscore';
import type { HTTPEvent } from 'vinxi/http';

/**
 *
 * Utility function to get env variables.
 *
 * @param name env variable name
 * @param defaultVaue default value to return if the env variable is not set
 * @param event - H3Event object for accessing runtime environment variables
 * @returns string
 *
 * @internal
 */
export const getEnvVariable = (name: string, defaultValue: string = '', event?: HTTPEvent) => {
  // Cloudflare context check
  const cfValue = event?.context?.cloudflare?.env[name];
  if (cfValue) {
    return cfValue;
  }

  // Node envs
  if (typeof process !== 'undefined' && process.env && typeof process.env[name] === 'string') {
    return process.env[name];
  }

  // Vite specific envs
  if (typeof import.meta !== 'undefined' && import.meta.env && typeof import.meta.env[name] === 'string') {
    return import.meta.env[name];
  }

  return defaultValue;
};

export const getPublicEnvVariables = (event?: HTTPEvent) => {
  const getValue = (name: string): string => {
    return getEnvVariable(`VITE_${name}`, '', event) || getEnvVariable(name, '', event);
  };

  return {
    publishableKey: getValue('CLERK_PUBLISHABLE_KEY'),
    domain: getValue('CLERK_DOMAIN'),
    isSatellite: isTruthy(getValue('CLERK_IS_SATELLITE')),
    proxyUrl: getValue('CLERK_PROXY_URL'),
    signInUrl: getValue('CLERK_SIGN_IN_URL'),
    signUpUrl: getValue('CLERK_SIGN_UP_URL'),
    clerkJsUrl: getValue('CLERK_JS_URL') || getValue('CLERK_JS'),
    clerkJsVariant: getValue('CLERK_JS_VARIANT') as '' | 'headless' | undefined,
    clerkJsVersion: getValue('CLERK_JS_VERSION'),
    telemetryDisabled: isTruthy(getValue('CLERK_TELEMETRY_DISABLED')),
    telemetryDebug: isTruthy(getValue('CLERK_TELEMETRY_DEBUG')),
    afterSignInUrl: getValue('CLERK_AFTER_SIGN_IN_URL'),
    afterSignUpUrl: getValue('CLERK_AFTER_SIGN_UP_URL'),
  } as const;
};
