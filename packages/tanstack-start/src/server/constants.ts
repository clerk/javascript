import { apiUrlFromPublishableKey } from '@clerk/shared/apiUrlFromPublishableKey';
import { getContext } from 'vinxi/http';

import { getEnvVariable, getPublicEnvVariables } from '../utils/env';

const getResolvedEnvVariable = (name: string) => {
  const value = getEnvVariable(name);

  // Cloudflare workers envs
  // Nitro injects CF envs into event.context.cloudflare.env property
  if (getContext('cloudflare')) {
    return getContext('cloudflare').env[name];
  }

  return value;
};

export const commonEnvs = () => {
  const publishableKey = getPublicEnvVariables().publishableKey || '';
  return {
    CLERK_JS_VERSION: getPublicEnvVariables().clerkJsVersion || '',
    CLERK_JS_URL: getPublicEnvVariables().clerkJsUrl || '',
    API_VERSION: getResolvedEnvVariable('CLERK_API_VERSION') || 'v1',
    SECRET_KEY: getResolvedEnvVariable('CLERK_SECRET_KEY') || '',
    PUBLISHABLE_KEY: getPublicEnvVariables().publishableKey || '',
    ENCRYPTION_KEY: getResolvedEnvVariable('CLERK_ENCRYPTION_KEY') || '',
    API_URL: getResolvedEnvVariable('CLERK_API_URL') || apiUrlFromPublishableKey(publishableKey),
    DOMAIN: getPublicEnvVariables().domain || '',
    PROXY_URL: getPublicEnvVariables().proxyUrl || '',
    CLERK_JWT_KEY: getResolvedEnvVariable('CLERK_JWT_KEY') || '',
    IS_SATELLITE: getPublicEnvVariables().isSatellite || false,
    SIGN_IN_URL: getPublicEnvVariables().signInUrl || '',
    SIGN_UP_URL: getPublicEnvVariables().signUpUrl || '',
    SDK_METADATA: {
      name: PACKAGE_NAME,
      version: PACKAGE_VERSION,
      environment: getResolvedEnvVariable('NODE_ENV'),
    },
    TELEMETRY_DISABLED: getPublicEnvVariables().telemetryDisabled,
    TELEMETRY_DEBUG: getPublicEnvVariables().telemetryDebug,
  } as const;
};
