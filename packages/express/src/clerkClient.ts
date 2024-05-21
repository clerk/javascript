import type { ClerkClient } from '@clerk/backend';
import { createClerkClient } from '@clerk/backend';

import { loadApiEnv, loadClientEnv } from './utils';

let clerkClientSingleton = {} as unknown as ClerkClient;

export const clerkClient = new Proxy(clerkClientSingleton, {
  get(_target, property: keyof ClerkClient) {
    if (property in clerkClientSingleton) {
      return clerkClientSingleton[property];
    }

    const env = { ...loadApiEnv(), ...loadClientEnv() };
    const client = createClerkClient({ ...env, userAgent: `${PACKAGE_NAME}@${PACKAGE_VERSION}` });

    // if the client is initialized properly, cache it to a singleton instance variable
    // in the next invocation the guard at the top will be triggered instead of creating another instance
    if (env.secretKey) {
      clerkClientSingleton = client;
    }

    return client[property];
  },
  set() {
    return false;
  },
});
