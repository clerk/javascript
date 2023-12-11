import type { ClerkOptions, VerifyTokenOptions } from '@clerk/backend';
import { Clerk as _Clerk, verifyToken as _verifyToken } from '@clerk/backend';

import { createClerkExpressRequireAuth } from './clerkExpressRequireAuth';
import { createClerkExpressWithAuth } from './clerkExpressWithAuth';
import { loadApiEnv, loadClientEnv } from './utils';

type ExtendedClerk = ReturnType<typeof _Clerk> & {
  expressWithAuth: ReturnType<typeof createClerkExpressWithAuth>;
  expressRequireAuth: ReturnType<typeof createClerkExpressRequireAuth>;
  verifyToken: typeof _verifyToken;
};

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
    return _verifyToken(token, { ...options, ...verifyOpts });
  };

  return Object.assign(clerkClient, {
    expressWithAuth,
    expressRequireAuth,
    verifyToken,
  });
}

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
