import type { Clerk } from '@clerk/clerk-js';

import { mountAllClerkAstroJSComponents } from './mount-clerk-astro-js-components';
import type { CreateClerkInstanceInternalFn } from './types';

/**
 * Prevents mounting components multiple times when the `createClerkInstanceInternal` was been called twice without await first
 * This is useful as the "integration" may call the function twice at the same time.
 */
const runOnce = (onFirst: CreateClerkInstanceInternalFn) => {
  let hasRun = false;
  return (params: Parameters<CreateClerkInstanceInternalFn>[0]) => {
    if (hasRun) {
      const clerkJSInstance = window.Clerk as Clerk;
      return new Promise(res => {
        if (!clerkJSInstance) {
          return res(false);
        }

        if (clerkJSInstance.loaded) {
          mountAllClerkAstroJSComponents();
        }
        return res(clerkJSInstance.loaded);
      });
    }
    /**
<<<<<<< HEAD
     * Probably html streaming has delayed the component from mounting immediately.
     * In Astro, js modules will start executing only after html streaming has ended.
=======
     * Probably html streaming has delayed the component from mounting immediately
>>>>>>> 956f8a51b (feat(astro): Introduce Astro SDK)
     */
    hasRun = true;
    return onFirst(params);
  };
};

export { runOnce };
