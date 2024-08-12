import { isTruthy } from '@clerk/shared';

/**
 *
 * Utility function to get env variables.
 *
 * @param name env variable name
 * @param defaultVaue default value to return if the env variable is not set
 * @returns string
 *
 * @internal
 */
export const getEnvVariable = (name: string, defaultVaue: string = ''): string => {
  // Node envs
  if (typeof process !== 'undefined' && process.env && typeof process.env[name] === 'string') {
    return (process.env[name] as string) || defaultVaue;
  }

  // @ts-expect-error - Vite specific
  if (typeof import.meta !== 'undefined' && import.meta.env && typeof import.meta.env[name] === 'string') {
    // @ts-expect-error - Vite specific
    return import.meta.env[name];
  }

  return defaultVaue;
};

export const getPublicEnvVariables = () => {
  return {
    publishableKey: getEnvVariable('VITE_PUBLIC_CLERK_PUBLISHABLE_KEY') || getEnvVariable('CLERK_PUBLISHABLE_KEY'),
    domain: getEnvVariable('VITE_PUBLIC_CLERK_DOMAIN') || getEnvVariable('CLERK_DOMAIN'),
    isSatellite:
      isTruthy(getEnvVariable('VITE_PUBLIC_CLERK_IS_SATELLITE')) || isTruthy(getEnvVariable('CLERK_IS_SATELLITE')),
    proxyUrl: getEnvVariable('VITE_PUBLIC_CLERK_PROXY_URL') || getEnvVariable('CLERK_PROXY_URL'),
    pk: getEnvVariable('VITE_PUBLIC_CLERK_PUBLISHABLE_KEY') || getEnvVariable('CLERK_PUBLISHABLE_KEY'),
    signInUrl: getEnvVariable('VITE_PUBLIC_CLERK_SIGN_IN_URL') || getEnvVariable('CLERK_SIGN_IN_URL'),
    signUpUrl: getEnvVariable('VITE_PUBLIC_CLERK_SIGN_UP_URL') || getEnvVariable('CLERK_SIGN_UP_URL'),
    clerkJsUrl: getEnvVariable('VITE_PUBLIC_CLERK_JS_URL') || getEnvVariable('CLERK_JS'),
    clerkJsVariant: (getEnvVariable('VITE_PUBLIC_CLERK_JS_VARIANT') || getEnvVariable('CLERK_JS_VARIANT')) as
      | ''
      | 'headless'
      | undefined,
    clerkJsVersion: getEnvVariable('VITE_PUBLIC_CLERK_JS_VERSION') || getEnvVariable('CLERK_JS_VERSION'),
    telemetryDisabled:
      isTruthy(getEnvVariable('VITE_PUBLIC_CLERK_TELEMETRY_DISABLED')) ||
      isTruthy(getEnvVariable('CLERK_TELEMETRY_DISABLED')),
    telemetryDebug: getEnvVariable('VITE_PUBLIC_CLERK_TELEMETRY_DEBUG') || getEnvVariable('CLERK_TELEMETRY_DEBUG'),
    afterSignInUrl: getEnvVariable('VITE_PUBLIC_CLERK_AFTER_SIGN_IN_URL') || getEnvVariable('CLERK_AFTER_SIGN_IN_URL'),
    afterSignUpUrl: getEnvVariable('VITE_PUBLIC_CLERK_AFTER_SIGN_UP_URL') || getEnvVariable('CLERK_AFTER_SIGN_UP_URL'),
  };
};
