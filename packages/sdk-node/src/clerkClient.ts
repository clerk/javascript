import type { ClerkOptions, VerifyTokenOptions } from '@clerk/backend';
import { Clerk as _Clerk, decodeJwt, verifyToken as _verifyToken } from '@clerk/backend';

import { createClerkExpressRequireAuth } from './clerkExpressRequireAuth';
import { createClerkExpressWithAuth } from './clerkExpressWithAuth';

export const API_URL = process.env.CLERK_API_URL || 'https://api.clerk.dev';
export const API_VERSION = process.env.CLERK_API_VERSION || 'v1';
export const API_KEY = process.env.CLERK_SECRET_KEY || process.env.CLERK_API_KEY || '';
export const PUBLISHABLE_KEY = process.env.CLERK_PUBLISHABLE_KEY || '';

/**
 * This needs to be a *named* function in order to support the older
 * new Clerk() syntax for v4 compatibility.
 * Arrow functions can never be called with the new keyword because they do not have the [[Construct]] method
 */
export function Clerk(options: ClerkOptions) {
  const clerkClient = _Clerk(options);
  const expressWithAuth = createClerkExpressWithAuth({ ...options, clerkClient });
  const expressRequireAuth = createClerkExpressRequireAuth({ ...options, clerkClient });
  const verifyToken = (token: string, verifyOpts?: VerifyTokenOptions) => {
    const issuer = (iss: string) => iss.startsWith('https://clerk.') || iss.includes('.clerk.accounts');
    return _verifyToken(token, { issuer, ...options, ...verifyOpts });
  };

  return {
    ...clerkClient,
    expressWithAuth,
    expressRequireAuth,
    verifyToken,
    ...createBasePropForRedwoodCompatibility(),
  };
}

const createBasePropForRedwoodCompatibility = () => {
  const verifySessionToken = (token: string) => {
    const { payload } = decodeJwt(token);
    return _verifyToken(token, {
      issuer: payload.iss,
      jwtKey: process.env.CLERK_JWT_KEY,
    });
  };
  return { base: { verifySessionToken } };
};

export const createClerkClient = Clerk;

export const clerkClient = Clerk({
  secretKey: API_KEY,
  apiKey: API_KEY,
  apiUrl: API_URL,
  apiVersion: API_VERSION,
  userAgent: '@clerk/clerk-sdk-node',
});

/**
 * Stand-alone express middlewares bound to the pre-initialised clerkClient
 */
export const ClerkExpressRequireAuth = createClerkExpressRequireAuth({
  clerkClient,
  apiUrl: API_URL,
  apiKey: API_KEY,
  secretKey: API_KEY,
});

export const ClerkExpressWithAuth = createClerkExpressWithAuth({
  clerkClient,
  apiUrl: API_URL,
  apiKey: API_KEY,
  secretKey: API_KEY,
});

/**
 * Stand-alone setters bound to the pre-initialised clerkClient
 */
export const setClerkApiKey = (value: string) => {
  clerkClient.__unstable_options.apiKey = value;
};

export const setClerkServerApiUrl = (value: string) => {
  clerkClient.__unstable_options.apiUrl = value;
};

export const setClerkApiVersion = (value: string) => {
  clerkClient.__unstable_options.apiVersion = value;
};

export const setClerkHttpOptions = (value: RequestInit) => {
  clerkClient.__unstable_options.httpOptions = value;
};
