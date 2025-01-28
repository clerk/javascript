import { getEnvVariable } from '@clerk/shared/getEnvVariable';
import { isTruthy } from '@clerk/shared/underscore';
import type { AppLoadContext } from 'react-router';

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
