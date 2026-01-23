import { isTruthy } from '@clerk/shared/underscore';

import type { AstroClerkIntegrationParams } from '../types';

/**
 * @internal
 */
const mergeEnvVarsWithParams = (params?: AstroClerkIntegrationParams & { publishableKey?: string }) => {
  const {
    signInUrl: paramSignIn,
    signUpUrl: paramSignUp,
    multiDomain: paramMultiDomain,
    proxyUrl: paramProxy,
    publishableKey: paramPublishableKey,
    telemetry: paramTelemetry,
    clerkJSUrl: paramClerkJSUrl,
    clerkUiUrl: paramClerkUiUrl,
    clerkJSVariant: paramClerkJSVariant,
    clerkJSVersion: paramClerkJSVersion,
    ...rest
  } = params || {};

  const isSatellite = paramMultiDomain?.isSatellite || import.meta.env.PUBLIC_CLERK_IS_SATELLITE;
  const domain = paramMultiDomain?.domain || import.meta.env.PUBLIC_CLERK_DOMAIN;

  return {
    signInUrl: paramSignIn || import.meta.env.PUBLIC_CLERK_SIGN_IN_URL,
    signUpUrl: paramSignUp || import.meta.env.PUBLIC_CLERK_SIGN_UP_URL,
    multiDomain: isSatellite
      ? {
          isSatellite: true as const,
          ...(domain ? { domain: domain as string } : {}),
        }
      : paramMultiDomain,
    proxyUrl: paramProxy || import.meta.env.PUBLIC_CLERK_PROXY_URL,
    publishableKey: paramPublishableKey || import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY || '',
    clerkUiUrl: paramClerkUiUrl || import.meta.env.PUBLIC_CLERK_UI_URL,
    clerkJSUrl: paramClerkJSUrl || import.meta.env.PUBLIC_CLERK_JS_URL,
    clerkJSVariant: paramClerkJSVariant || import.meta.env.PUBLIC_CLERK_JS_VARIANT,
    clerkJSVersion: paramClerkJSVersion || import.meta.env.PUBLIC_CLERK_JS_VERSION,
    telemetry: paramTelemetry || {
      disabled: isTruthy(import.meta.env.PUBLIC_CLERK_TELEMETRY_DISABLED),
      debug: isTruthy(import.meta.env.PUBLIC_CLERK_TELEMETRY_DEBUG),
    },
    ...rest,
  };
};

export { mergeEnvVarsWithParams };
