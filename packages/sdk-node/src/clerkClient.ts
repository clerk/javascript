import type { ClerkOptions, VerifyTokenOptions } from '@clerk/backend';
import { Clerk as _Clerk, decodeJwt, verifyToken as _verifyToken } from '@clerk/backend';

import { createClerkExpressRequireAuth } from './clerkExpressRequireAuth';
import { createClerkExpressWithAuth } from './clerkExpressWithAuth';

export const loadClientEnv = () => {
  return {
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY || '',
    frontendApi: process.env.CLERK_FRONTEND_API || '',
    clerkJSUrl: process.env.CLERK_JS || '',
    clerkJSVersion: process.env.CLERK_JS_VERSION || '',
  };
};

export const loadApiEnv = () => {
  return {
    secretKey: process.env.CLERK_SECRET_KEY || process.env.CLERK_API_KEY || '',
    apiKey: process.env.CLERK_SECRET_KEY || process.env.CLERK_API_KEY || '',
    apiUrl: process.env.CLERK_API_URL || 'https://api.clerk.dev',
    apiVersion: process.env.CLERK_API_VERSION || 'v1',
    domain: process.env.CLERK_DOMAIN || '',
    proxyUrl: process.env.CLERK_PROXY_URL || '',
    signInUrl: process.env.CLERK_SIGN_IN_URL || '',
    isSatellite: process.env.CLERK_IS_SATELLITE === 'true',
  };
};

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

let clerkClientSingleton = {} as unknown as ReturnType<typeof Clerk>;

export const clerkClient = new Proxy(clerkClientSingleton, {
  get(_target, property) {
    const env = { ...loadApiEnv(), ...loadClientEnv() };
    if (!env.secretKey) {
      clerkClientSingleton = Clerk({
        ...env,
        userAgent: '@clerk/clerk-sdk-node',
      });
    }
    // @ts-ignore
    return clerkClientSingleton[property];
  },
  set() {
    return false;
  },
});

/**
 * Stand-alone express middlewares bound to the pre-initialised clerkClient
 */
export const ClerkExpressRequireAuth = (...args: any) => {
  const env = { ...loadApiEnv(), ...loadClientEnv() };
  const fn = createClerkExpressRequireAuth({ clerkClient, ...env });
  return fn(...args);
};

export const ClerkExpressWithAuth = (...args: any) => {
  const env = { ...loadApiEnv(), ...loadClientEnv() };
  const fn = createClerkExpressWithAuth({ clerkClient, ...env });
  return fn(...args);
};

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
