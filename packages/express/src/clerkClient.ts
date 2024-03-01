import { createClerkClient } from '@clerk/backend';

import { loadApiEnv, loadClientEnv } from './utils';

let clerkClientSingleton = {} as unknown as ReturnType<typeof createClerkClient>;

export const clerkClient = new Proxy(clerkClientSingleton, {
  get(_target, property: string) {
    const hasBeenInitialised = !!clerkClientSingleton.authenticateRequest;
    if (hasBeenInitialised) {
      // @ts-expect-error - Element implicitly has an 'any' type because expression of type 'string | symbol' can't be used to index type 'ExtendedClerk'.
      return clerkClientSingleton[property];
    }

    const env = { ...loadApiEnv(), ...loadClientEnv() };
    if (env.secretKey) {
      clerkClientSingleton = createClerkClient({ ...env, userAgent: `${PACKAGE_NAME}@${PACKAGE_VERSION}` });
      // @ts-expect-error - Element implicitly has an 'any' type because expression of type 'string | symbol' can't be used to index type 'ExtendedClerk'.
      return clerkClientSingleton[property];
    }

    const c = createClerkClient({ ...env, userAgent: `${PACKAGE_NAME}@${PACKAGE_VERSION}` });
    // @ts-expect-error - Element implicitly has an 'any' type because expression of type 'string | symbol' can't be used to index type 'ExtendedClerk'.
    return c[property];
  },
  set() {
    return false;
  },
});
