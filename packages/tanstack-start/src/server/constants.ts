import { apiUrlFromPublishableKey } from '@clerk/shared/apiUrlFromPublishableKey';

import { getEnvVariable, getPublicEnvVariables } from '../utils/env';

// @ts-expect-error - TODO: Improve types
export const commonEnvs = () =>
  ({
    CLERK_JS_VERSION: getPublicEnvVariables().clerkJsVersion || '',
    CLERK_JS_URL: getPublicEnvVariables().clerkJsUrl || '',
    API_VERSION: getEnvVariable('CLERK_API_VERSION') || 'v1',
    SECRET_KEY: getEnvVariable('CLERK_SECRET_KEY') || '',
    PUBLISHABLE_KEY: getPublicEnvVariables().publishableKey || '',
    ENCRYPTION_KEY: getEnvVariable('CLERK_ENCRYPTION_KEY') || '',
    API_URL: getEnvVariable('CLERK_API_URL') || apiUrlFromPublishableKey(commonEnvs().PUBLISHABLE_KEY),
    DOMAIN: getPublicEnvVariables().domain || '',
    PROXY_URL: getPublicEnvVariables().proxyUrl || '',
    CLERK_JWT_KEY: getEnvVariable('CLERK_JWT_KEY') || '',
    IS_SATELLITE: getPublicEnvVariables().isSatellite || false,
    SIGN_IN_URL: getPublicEnvVariables().signInUrl || '',
    SIGN_UP_URL: getPublicEnvVariables().signUpUrl || '',
    SDK_METADATA: {
      name: PACKAGE_NAME,
      version: PACKAGE_VERSION,
      environment: getEnvVariable('NODE_ENV'),
    },
    TELEMETRY_DISABLED: getPublicEnvVariables().telemetryDisabled,
    TELEMETRY_DEBUG: getPublicEnvVariables().telemetryDebug,
  }) as const;
