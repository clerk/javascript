import { apiUrlFromPublishableKey } from '@clerk/shared/apiUrlFromPublishableKey';
import { isTruthy } from '@clerk/shared/underscore';

export const CLERK_JS_VERSION = process.env.NEXT_PUBLIC_CLERK_JS_VERSION || '';
export const CLERK_JS_URL = process.env.NEXT_PUBLIC_CLERK_JS_URL || '';
export const CLERK_UI_VERSION = process.env.NEXT_PUBLIC_CLERK_UI_VERSION || '';
export const CLERK_UI_URL = process.env.NEXT_PUBLIC_CLERK_UI_URL || '';
export const API_VERSION = process.env.CLERK_API_VERSION || 'v1';
export const SECRET_KEY = process.env.CLERK_SECRET_KEY || '';
export const MACHINE_SECRET_KEY = process.env.CLERK_MACHINE_SECRET_KEY || '';
export const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '';
export const ENCRYPTION_KEY = process.env.CLERK_ENCRYPTION_KEY || '';
export const API_URL = process.env.CLERK_API_URL || apiUrlFromPublishableKey(PUBLISHABLE_KEY);
export const DOMAIN = process.env.NEXT_PUBLIC_CLERK_DOMAIN || '';
export const PROXY_URL = process.env.NEXT_PUBLIC_CLERK_PROXY_URL || '';
export const IS_SATELLITE = isTruthy(process.env.NEXT_PUBLIC_CLERK_IS_SATELLITE) || false;
export const SIGN_IN_URL = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || '';
export const SIGN_UP_URL = process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || '';
export const SDK_METADATA = {
  name: PACKAGE_NAME,
  version: PACKAGE_VERSION,
  environment: process.env.NODE_ENV,
};

export const TELEMETRY_DISABLED = isTruthy(process.env.NEXT_PUBLIC_CLERK_TELEMETRY_DISABLED);
export const TELEMETRY_DEBUG = isTruthy(process.env.NEXT_PUBLIC_CLERK_TELEMETRY_DEBUG);

export const KEYLESS_DISABLED = isTruthy(process.env.NEXT_PUBLIC_CLERK_KEYLESS_DISABLED) || false;
