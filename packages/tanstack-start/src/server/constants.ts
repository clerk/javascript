import { apiUrlFromPublishableKey } from '@clerk/shared/apiUrlFromPublishableKey';
import { getEvent } from 'vinxi/http';

import { getEnvVariable, getPublicEnvVariables } from '../utils/env';

export const commonEnvs = () => {
  const event = getEvent();
  const publicEnvs = getPublicEnvVariables(event);

  return {
    // Public environment variables
    CLERK_JS_VERSION: publicEnvs.clerkJsVersion,
    CLERK_JS_URL: publicEnvs.clerkJsUrl,
    PUBLISHABLE_KEY: publicEnvs.publishableKey,
    DOMAIN: publicEnvs.domain,
    PROXY_URL: publicEnvs.proxyUrl,
    IS_SATELLITE: publicEnvs.isSatellite,
    SIGN_IN_URL: publicEnvs.signInUrl,
    SIGN_UP_URL: publicEnvs.signUpUrl,
    TELEMETRY_DISABLED: publicEnvs.telemetryDisabled,
    TELEMETRY_DEBUG: publicEnvs.telemetryDebug,
    DANGEROUSLY_DISABLE_DEVELOPMENT_MODE_WARNING: publicEnvs.dangerouslyDisableDevelopmentModeWarning,

    // Server-only environment variables
    API_VERSION: getEnvVariable('CLERK_API_VERSION', 'v1', event),
    SECRET_KEY: getEnvVariable('CLERK_SECRET_KEY', '', event),
    ENCRYPTION_KEY: getEnvVariable('CLERK_ENCRYPTION_KEY', '', event),
    CLERK_JWT_KEY: getEnvVariable('CLERK_JWT_KEY', '', event),
    API_URL: getEnvVariable('CLERK_API_URL', '', event) || apiUrlFromPublishableKey(publicEnvs.publishableKey),

    SDK_METADATA: {
      name: PACKAGE_NAME,
      version: PACKAGE_VERSION,
      environment: getEnvVariable('NODE_ENV', '', event),
    },
  } as const;
};
