import { deprecated } from '@clerk/shared/deprecated';

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
export const FRONTEND_API = process.env.GATSBY_CLERK_FRONTEND_API || '';
if (FRONTEND_API) {
  deprecated('FRONTEND_API', 'Use `PUBLISHABLE_KEY` environment variable instead.');
}
export const PUBLISHABLE_KEY = process.env.GATSBY_CLERK_PUBLISHABLE_KEY || '';

export const CLERK_JS = process.env.GATSBY_CLERK_JS;
export const PROXY_URL = process.env.GATSBY_CLERK_PROXY_URL;
