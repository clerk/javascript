import { createClerkClient } from '@clerk/backend';
import { deprecated } from '@clerk/shared/deprecated';

import { API_URL, API_VERSION, SECRET_KEY } from './constants';

const clerkClientSingleton = createClerkClient({ secretKey: SECRET_KEY, apiVersion: API_VERSION, apiUrl: API_URL });

/**
 * @deprecated
 * Accessing `clerkClient` as a variable is deprecated and will be removed in a future release. Please use `clerkClient()` as a function instead.
 */
const clerkClient = new Proxy(clerkClientSingleton, {
  get(target, prop, receiver) {
    deprecated('clerkClient object', 'Use `clerkClient()` as a function instead.');

    return Reflect.get(target, prop, receiver);
  },
});

export { clerkClient };
