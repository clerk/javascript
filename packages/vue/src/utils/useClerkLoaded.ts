import type { LoadedClerk } from '@clerk/shared/types';
import { watch } from 'vue';

import { useClerk } from '../composables';

/**
 * Executes a callback when Clerk is loaded.
 *
 * @param callback - Function to execute once Clerk is loaded
 * @example
 * ```ts
 * useClerkLoaded((clerk) => {
 *   clerk.redirectToSignUp(props);
 * });
 * ```
 */
export const useClerkLoaded = (callback: (clerk: LoadedClerk) => void) => {
  const clerk = useClerk();

  let unwatch: (() => void) | undefined;
  // eslint-disable-next-line prefer-const
  unwatch = watch(
    clerk,
    unwrappedClerk => {
      if (!unwrappedClerk?.loaded) {
        return;
      }

      callback(unwrappedClerk as LoadedClerk);
      unwatch?.();
    },
    { immediate: true },
  );
};
