import { apiUrlFromPublishableKey } from '@clerk/shared/apiUrlFromPublishableKey';
import { getEnvVariable } from '@clerk/shared/getEnvVariable';
import { isTruthy } from '@clerk/shared/underscore';

export const CLERK_JS_VERSION = getEnvVariable('NEXT_PUBLIC_CLERK_JS_VERSION') || '';
export const CLERK_JS_URL = getEnvVariable('NEXT_PUBLIC_CLERK_JS_URL') || '';
export const API_VERSION = getEnvVariable('CLERK_API_VERSION') || 'v1';
export const SECRET_KEY = getEnvVariable('CLERK_SECRET_KEY') || '';
export const PUBLISHABLE_KEY = getEnvVariable('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY') || '';
export const ENCRYPTION_KEY = getEnvVariable('CLERK_ENCRYPTION_KEY') || '';
export const API_URL = getEnvVariable('CLERK_API_URL') || apiUrlFromPublishableKey(PUBLISHABLE_KEY);
export const DOMAIN = getEnvVariable('NEXT_PUBLIC_CLERK_DOMAIN') || '';
export const PROXY_URL = getEnvVariable('NEXT_PUBLIC_CLERK_PROXY_URL') || '';
export const IS_SATELLITE = isTruthy(getEnvVariable('NEXT_PUBLIC_CLERK_IS_SATELLITE')) || false;
export const SIGN_IN_URL = getEnvVariable('NEXT_PUBLIC_CLERK_SIGN_IN_URL') || '';
export const SIGN_UP_URL = getEnvVariable('NEXT_PUBLIC_CLERK_SIGN_UP_URL') || '';
export const SDK_METADATA = {
  name: PACKAGE_NAME,
  version: PACKAGE_VERSION,
  environment: getEnvVariable('NODE_ENV'),
};

export const TELEMETRY_DISABLED = isTruthy(getEnvVariable('NEXT_PUBLIC_CLERK_TELEMETRY_DISABLED'));
export const TELEMETRY_DEBUG = isTruthy(getEnvVariable('NEXT_PUBLIC_CLERK_TELEMETRY_DEBUG'));

export const ENABLE_KEYLESS = isTruthy(getEnvVariable('NEXT_PUBLIC_CLERK_ENABLE_KEYLESS'));
