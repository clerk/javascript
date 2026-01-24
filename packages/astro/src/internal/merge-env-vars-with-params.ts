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
    clerkJSUrl: paramClerkJSUrl,
    clerkUiUrl: paramClerkUiUrl,
    clerkJSVariant: paramClerkJSVariant,
    clerkJSVersion: paramClerkJSVersion,
    // Extract `ui` separately to avoid spreading the branded Ui type which contains
    // an unexported Tags symbol that breaks TypeScript declaration file generation.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ui: _paramUi,
    ...rest
  } = params || {};

  return {
    signInUrl: paramSignIn || import.meta.env.PUBLIC_CLERK_SIGN_IN_URL,
    signUpUrl: paramSignUp || import.meta.env.PUBLIC_CLERK_SIGN_UP_URL,
    isSatellite: paramSatellite || import.meta.env.PUBLIC_CLERK_IS_SATELLITE,
    proxyUrl: paramProxy || import.meta.env.PUBLIC_CLERK_PROXY_URL,
    domain: paramDomain || import.meta.env.PUBLIC_CLERK_DOMAIN,
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
