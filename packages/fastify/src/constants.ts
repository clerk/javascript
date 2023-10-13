/* eslint-disable turbo/no-undeclared-env-vars */
import { constants } from '@clerk/backend';
import { deprecated } from '@clerk/shared/deprecated';

export const API_URL = process.env.CLERK_API_URL || 'https://api.clerk.com';
export const API_VERSION = process.env.CLERK_API_VERSION || 'v1';
/**
 * Backend API key
 * @deprecated Use `CLERK_SECRET_KEY` instead.
 */
export const API_KEY = process.env.CLERK_API_KEY || '';
if (API_KEY) {
  deprecated('CLERK_API_KEY', 'Use `CLERK_SECRET_KEY` environment variable instead.');
}
export const SECRET_KEY = process.env.CLERK_SECRET_KEY || '';
/**
 * @deprecated Use `CLERK_PUBLISHABLE_KEY` instead.
 */
export const FRONTEND_API = process.env.CLERK_FRONTEND_API || '';
if (FRONTEND_API) {
  deprecated('CLERK_FRONTEND_API', 'Use `CLERK_PUBLISHABLE_KEY` environment variable instead.');
}
export const PUBLISHABLE_KEY = process.env.CLERK_PUBLISHABLE_KEY || '';
export const JWT_KEY = process.env.CLERK_JWT_KEY || '';

export const { Cookies, Headers } = constants;
