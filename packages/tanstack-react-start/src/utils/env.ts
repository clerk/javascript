import { getEnvVariable } from '@clerk/shared/getEnvVariable';
import { isTruthy } from '@clerk/shared/underscore';

export const getPublicEnvVariables = () => {
  const getValue = (name: string): string => {
    return getEnvVariable(`VITE_${name}`) || getEnvVariable(name);
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
    newSubscriptionRedirectUrl: getValue('CLERK_CHECKOUT_CONTINUE_URL'),
  } as const;
};
