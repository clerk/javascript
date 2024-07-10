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
    ...rest
  } = params || {};

  return {
    signInUrl: paramSignIn || import.meta.env.PUBLIC_ASTRO_APP_CLERK_SIGN_IN_URL,
    signUpUrl: paramSignUp || import.meta.env.PUBLIC_ASTRO_APP_CLERK_SIGN_UP_URL,
    isSatellite: paramSatellite || import.meta.env.PUBLIC_ASTRO_APP_CLERK_IS_SATELLITE,
    proxyUrl: paramProxy || import.meta.env.PUBLIC_ASTRO_APP_CLERK_PROXY_URL,
    domain: paramDomain || import.meta.env.PUBLIC_ASTRO_APP_CLERK_DOMAIN,
    publishableKey: paramPublishableKey || import.meta.env.PUBLIC_ASTRO_APP_CLERK_PUBLISHABLE_KEY || '',
    ...rest,
  };
};

export { mergeEnvVarsWithParams };
