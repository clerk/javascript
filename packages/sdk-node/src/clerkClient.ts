import { Clerk } from '@clerk/backend';

export const API_URL = process.env.CLERK_API_URL || 'https://api.clerk.dev';
export const API_VERSION = process.env.CLERK_API_VERSION || 'v1';
export const API_KEY = process.env.CLERK_API_KEY || '';

export const clerkClient = Clerk({
  apiKey: API_KEY,
  apiUrl: API_URL,
  apiVersion: API_VERSION,
  userAgent: '@clerk/clerk-sdk-node',
});

export const createClerkClient = Clerk;
