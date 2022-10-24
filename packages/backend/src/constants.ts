export const API_KEY = process.env.CLERK_API_KEY;
export const API_URL = process.env.CLERK_API_URL || 'https://api.clerk.dev';
export const API_VERSION = process.env.CLERK_API_VERSION || 'v1';
export const JWT_KEY = process.env.CLERK_JWT_KEY;

// TODO: Get information from package.json
export const USER_AGENT = process.env.CLERK_USER_AGENT || '@clerk/backend';
