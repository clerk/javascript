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
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    signInUrl: paramSignIn || import.meta.env.PUBLIC_CLERK_SIGN_IN_URL,
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    signUpUrl: paramSignUp || import.meta.env.PUBLIC_CLERK_SIGN_UP_URL,
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    isSatellite: paramSatellite || import.meta.env.PUBLIC_CLERK_IS_SATELLITE,
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    proxyUrl: paramProxy || import.meta.env.PUBLIC_CLERK_PROXY_URL,
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    domain: paramDomain || import.meta.env.PUBLIC_CLERK_DOMAIN,
    // eslint-disable-next-line turbo/no-undeclared-env-vars
    publishableKey: paramPublishableKey || import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY || '',
    ...rest,
  };
};

export { mergeEnvVarsWithParams };
