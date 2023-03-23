import { Clerk } from '@clerk/backend';

export const JS_VERSION = process.env.CLERK_JS_VERSION || '';
export const API_URL = process.env.CLERK_API_URL || 'https://api.clerk.dev';
export const API_VERSION = process.env.CLERK_API_VERSION || 'v1';
export const API_KEY = process.env.CLERK_API_KEY || '';
export const SECRET_KEY = process.env.CLERK_SECRET_KEY || '';
export const FRONTEND_API = process.env.NEXT_PUBLIC_CLERK_FRONTEND_API || '';
export const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '';
export const DOMAIN = process.env.NEXT_PUBLIC_CLERK_DOMAIN || '';
export const PROXY_URL = process.env.NEXT_PUBLIC_CLERK_PROXY_URL || '';
export const IS_SATELLITE = process.env.NEXT_PUBLIC_CLERK_IS_SATELLITE === 'true' || false;
export const SIGN_IN_URL = process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || '';

const clerkClient = Clerk({
  apiKey: API_KEY,
  secretKey: SECRET_KEY,
  apiUrl: API_URL,
  apiVersion: API_VERSION,
  // TODO: Fetch version from package.json
  userAgent: '@clerk/nextjs',
  proxyUrl: PROXY_URL,
  domain: DOMAIN,
  isSatellite: IS_SATELLITE,
});

const createClerkClient = Clerk;

export { clerkClient, createClerkClient, Clerk };

export * from '@clerk/backend';
