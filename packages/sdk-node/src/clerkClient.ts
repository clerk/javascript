import type { ClerkOptions, VerifyTokenOptions } from '@clerk/backend';
import { Clerk as _Clerk, decodeJwt, verifyToken as _verifyToken } from '@clerk/backend';

import { createClerkExpressRequireAuth } from './clerkExpressRequireAuth';
import { createClerkExpressWithAuth } from './clerkExpressWithAuth';
import { loadApiEnv, loadClientEnv } from './utils';

type ExtendedClerk = ReturnType<typeof _Clerk> & {
  expressWithAuth: ReturnType<typeof createClerkExpressWithAuth>;
  expressRequireAuth: ReturnType<typeof createClerkExpressRequireAuth>;
  verifyToken: (token: string, verifyOpts?: Parameters<typeof _verifyToken>[1]) => ReturnType<typeof _verifyToken>;
} & ReturnType<typeof createBasePropForRedwoodCompatibility>;

/**
 * This needs to be a *named* function in order to support the older
 * new Clerk() syntax for v4 compatibility.
 * Arrow functions can never be called with the new keyword because they do not have the [[Construct]] method
 */
export function Clerk(options: ClerkOptions): ExtendedClerk {
  const clerkClient = _Clerk(options);
  const expressWithAuth = createClerkExpressWithAuth({ ...options, clerkClient });
  const expressRequireAuth = createClerkExpressRequireAuth({ ...options, clerkClient });
  const verifyToken = (token: string, verifyOpts?: VerifyTokenOptions) => {
    const issuer = (iss: string) => iss.startsWith('https://clerk.') || iss.includes('.clerk.accounts');
    return _verifyToken(token, { issuer, ...options, ...verifyOpts });
  };

  return Object.assign(clerkClient, {
    expressWithAuth,
    expressRequireAuth,
    verifyToken,
    ...createBasePropForRedwoodCompatibility(),
  });
}

const createBasePropForRedwoodCompatibility = () => {
  const verifySessionToken = (token: string) => {
    const { jwtKey } = loadApiEnv();
    const { payload } = decodeJwt(token);
    return _verifyToken(token, {
      issuer: payload.iss,
      jwtKey,
    });
  };
  return { base: { verifySessionToken } };
};

export const createClerkClient = Clerk;

let clerkClientSingleton = {} as unknown as ReturnType<typeof Clerk>;

export const clerkClient = new Proxy(clerkClientSingleton, {
  get(_target, property) {
    const hasBeenInitialised = !!clerkClientSingleton.authenticateRequest;
    if (hasBeenInitialised) {
      // @ts-expect-error
      return clerkClientSingleton[property];
    }

    const env = { ...loadApiEnv(), ...loadClientEnv() };
    if (env.secretKey) {
      clerkClientSingleton = Clerk({ ...env, userAgent: '@clerk/clerk-sdk-node' });
      // @ts-expect-error
      return clerkClientSingleton[property];
    }

    // @ts-expect-error
    return Clerk({ ...env, userAgent: '@clerk/clerk-sdk-node' })[property];
  },
  set() {
    return false;
  },
});

/**
 * Stand-alone express middlewares bound to the pre-initialised clerkClient
 */
export const ClerkExpressRequireAuth = (...args: Parameters<ReturnType<typeof createClerkExpressRequireAuth>>) => {
  const env = { ...loadApiEnv(), ...loadClientEnv() };
  const fn = createClerkExpressRequireAuth({ clerkClient, ...env });
  return fn(...args);
};

export const ClerkExpressWithAuth = (...args: Parameters<ReturnType<typeof createClerkExpressWithAuth>>) => {
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
