import { invokeClerkAstroJSFunctions } from './invoke-clerk-astro-js-functions';
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
      const clerkJSInstance = window.Clerk;
      return new Promise(res => {
        if (!clerkJSInstance) {
          return res(false);
        }

        if (clerkJSInstance.loaded) {
          mountAllClerkAstroJSComponents();
          invokeClerkAstroJSFunctions();
        }
        return res(clerkJSInstance.loaded);
      });
    }
    /**
     * Probably html streaming has delayed the component from mounting immediately.
     * In Astro, js modules will start executing only after html streaming has ended.
     */
    hasRun = true;
    return onFirst(params);
  };
};

export { runOnce };
