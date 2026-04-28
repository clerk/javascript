import { apiUrlFromPublishableKey } from '@clerk/shared/apiUrlFromPublishableKey';
import { getEnvVariable } from '@clerk/shared/getEnvVariable';

import { getPublicEnvVariables } from '../utils/env';
import { getCloudflareWorkerEnv } from './cloudflareEnv';

export const commonEnvs = (context?: Record<string, any>) => {
  // On Cloudflare Workers, resolve env from the runtime.
  // Falls back to undefined on non-CF environments.
  const cfEnv = context ?? getCloudflareWorkerEnv();
  const publicEnvs = getPublicEnvVariables(cfEnv);

  return {
    // Public environment variables
    CLERK_JS_VERSION: publicEnvs.clerkJsVersion,
    CLERK_JS_URL: publicEnvs.clerkJsUrl,
    CLERK_UI_URL: publicEnvs.clerkUIUrl,
    CLERK_UI_VERSION: publicEnvs.clerkUIVersion,
    PREFETCH_UI: publicEnvs.prefetchUI,
    PUBLISHABLE_KEY: publicEnvs.publishableKey,
    DOMAIN: publicEnvs.domain,
    PROXY_URL: publicEnvs.proxyUrl,
    IS_SATELLITE: publicEnvs.isSatellite,
    SIGN_IN_URL: publicEnvs.signInUrl,
    SIGN_UP_URL: publicEnvs.signUpUrl,
    TELEMETRY_DISABLED: publicEnvs.telemetryDisabled,
    TELEMETRY_DEBUG: publicEnvs.telemetryDebug,

    // Server-only environment variables
    API_VERSION: getEnvVariable('CLERK_API_VERSION', cfEnv) || 'v1',
    SECRET_KEY: getEnvVariable('CLERK_SECRET_KEY', cfEnv),
    MACHINE_SECRET_KEY: getEnvVariable('CLERK_MACHINE_SECRET_KEY', cfEnv),
    ENCRYPTION_KEY: getEnvVariable('CLERK_ENCRYPTION_KEY', cfEnv),
    CLERK_JWT_KEY: getEnvVariable('CLERK_JWT_KEY', cfEnv),
    API_URL: getEnvVariable('CLERK_API_URL', cfEnv) || apiUrlFromPublishableKey(publicEnvs.publishableKey),

    SDK_METADATA: {
      name: PACKAGE_NAME,
      version: PACKAGE_VERSION,
      environment: getEnvVariable('NODE_ENV', cfEnv),
    },
  } as const;
};
