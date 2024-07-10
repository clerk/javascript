import { isTruthy } from '@clerk/shared/underscore';

import type { AstroClerkIntegrationParams } from '../types';

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
    ...rest
  } = params || {};

  // We have an eslint config that requires us to declare env variables in the turbo.json file.
  // We're skipping/disabling it below as we use it only for the Astro integration.
  return {
    signInUrl: paramSignIn || import.meta.env.PUBLIC_CLERK_SIGN_IN_URL,
    signUpUrl: paramSignUp || import.meta.env.PUBLIC_CLERK_SIGN_UP_URL,
    isSatellite: paramSatellite || import.meta.env.PUBLIC_CLERK_IS_SATELLITE,
    proxyUrl: paramProxy || import.meta.env.PUBLIC_CLERK_PROXY_URL,
    domain: paramDomain || import.meta.env.PUBLIC_CLERK_DOMAIN,
    publishableKey: paramPublishableKey || import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY || '',
    telemetry: paramTelemetry || {
      disabled: isTruthy(import.meta.env.PUBLIC_CLERK_TELEMETRY_DISABLED),
      debug: isTruthy(import.meta.env.PUBLIC_CLERK_TELEMETRY_DEBUG),
    },
    ...rest,
  };
};

export { mergeEnvVarsWithParams };
