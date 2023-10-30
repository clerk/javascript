import { constants } from '@clerk/backend';

export const API_URL = process.env.CLERK_API_URL || 'https://api.clerk.com';
export const API_VERSION = process.env.CLERK_API_VERSION || 'v1';
export const SECRET_KEY = process.env.CLERK_SECRET_KEY || '';
export const PUBLISHABLE_KEY = process.env.CLERK_PUBLISHABLE_KEY || '';
export const JWT_KEY = process.env.CLERK_JWT_KEY || '';

export const { Cookies, Headers } = constants;
