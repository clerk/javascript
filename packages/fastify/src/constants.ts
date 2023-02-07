import { constants } from '@clerk/backend';

export const API_URL = process.env.CLERK_API_URL || 'https://api.clerk.dev';
export const API_VERSION = process.env.CLERK_API_VERSION || 'v1';
/**
 * Backend API key
 * @deprecated Use `CLERK_SECRET_KEY` instead.
 */
export const API_KEY = process.env.CLERK_API_KEY || '';
export const SECRET_KEY = process.env.CLERK_SECRET_KEY || '';
/**
 * @deprecated Use `CLERK_PUBLISHABLE_KEY` instead.
 */
export const FRONTEND_API = process.env.CLERK_FRONTEND_API || '';
export const PUBLISHABLE_KEY = process.env.CLERK_PUBLISHABLE_KEY || '';
export const JWT_KEY = process.env.CLERK_JWT_KEY || '';

export const { Cookies, Headers } = constants;
