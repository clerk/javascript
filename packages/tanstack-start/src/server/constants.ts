import { apiUrlFromPublishableKey } from '@clerk/shared/apiUrlFromPublishableKey';

import { getEnvVariable, getPublicEnvVariables } from '../utils/env';

export const CLERK_JS_VERSION = getPublicEnvVariables().clerkJsVersion || '';
export const CLERK_JS_URL = getPublicEnvVariables().clerkJsUrl || '';
export const API_VERSION = getEnvVariable('CLERK_API_VERSION') || 'v1';
export const SECRET_KEY = getEnvVariable('CLERK_SECRET_KEY') || '';
export const PUBLISHABLE_KEY = getPublicEnvVariables().publishableKey || '';
export const ENCRYPTION_KEY = getEnvVariable('CLERK_ENCRYPTION_KEY') || '';
export const API_URL = getEnvVariable('CLERK_API_URL') || apiUrlFromPublishableKey(PUBLISHABLE_KEY);
export const DOMAIN = getPublicEnvVariables().domain || '';
export const PROXY_URL = getPublicEnvVariables().proxyUrl || '';
export const CLERK_JWT_KEY = getEnvVariable('CLERK_JWT_KEY') || '';
export const IS_SATELLITE = getPublicEnvVariables().isSatellite || false;
export const SIGN_IN_URL = getPublicEnvVariables().signInUrl || '';
export const SIGN_UP_URL = getPublicEnvVariables().signUpUrl || '';
export const SDK_METADATA = {
  name: PACKAGE_NAME,
  version: PACKAGE_VERSION,
  environment: getEnvVariable('NODE_ENV'),
};

export const TELEMETRY_DISABLED = getPublicEnvVariables().telemetryDisabled;
export const TELEMETRY_DEBUG = getPublicEnvVariables().telemetryDebug;
