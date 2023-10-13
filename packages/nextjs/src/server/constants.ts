import { deprecated } from '@clerk/shared/deprecated';

/**
 * @deprecated Use `CLERK_JS_VERSION` instead.
 */
export const JS_VERSION = process.env.CLERK_JS_VERSION || '';
if (JS_VERSION) {
  deprecated('CLERK_JS_VERSION', 'Use `NEXT_PUBLIC_CLERK_JS_VERSION` environment variable instead.');
}
export const CLERK_JS_VERSION = process.env.NEXT_PUBLIC_CLERK_JS_VERSION || '';
export const CLERK_JS_URL = process.env.NEXT_PUBLIC_CLERK_JS || '';
export const API_URL = process.env.CLERK_API_URL || 'https://api.clerk.com';
export const API_VERSION = process.env.CLERK_API_VERSION || 'v1';
/**
 * @deprecated Use `CLERK_SECRET_KEY` instead.
 */
export const API_KEY = process.env.CLERK_API_KEY || '';
if (API_KEY) {
  deprecated('CLERK_API_KEY', 'Use `CLERK_SECRET_KEY` environment variable instead.');
}
export const SECRET_KEY = process.env.CLERK_SECRET_KEY || '';
/**
 * @deprecated Use `PUBLISHABLE_KEY` instead.
 */
export const FRONTEND_API = process.env.NEXT_PUBLIC_CLERK_FRONTEND_API || '';
if (FRONTEND_API) {
  deprecated('NEXT_PUBLIC_CLERK_FRONTEND_API', 'Use `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` environment variable instead.');
}
export const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '';
export const DOMAIN = process.env.NEXT_PUBLIC_CLERK_DOMAIN || '';
export const PROXY_URL = process.env.NEXT_PUBLIC_CLERK_PROXY_URL || '';
export const IS_SATELLITE = process.env.NEXT_PUBLIC_CLERK_IS_SATELLITE === 'true' || false;
export const SIGN_IN_URL = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || '';
export const SIGN_UP_URL = process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || '';
