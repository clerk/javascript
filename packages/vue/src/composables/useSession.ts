import type { UseSessionReturn } from '@clerk/types';
import { computed } from 'vue';

import type { ToComputedRefs } from '../utils';
import { toComputedRefs } from '../utils';
import { useClerkContext } from './useClerkContext';

type UseSession = () => ToComputedRefs<UseSessionReturn>;

/**
 * Returns the current [`Session`](https://clerk.com/docs/references/javascript/session) object which provides
 * information about the active session and methods to manage it.
 *
 * @example
 * <script setup>
 * import { useSession } from '@clerk/vue'
 *
 * const { isLoaded, session, isSignedIn } = useSession()
 * </script>
 *
 * <template>
 *   <div v-if="!isLoaded">
 *     <!-- Handle loading state -->
 *   </div>
 *
 *   <div v-else-if="!isSignedIn">
 *     <!-- Handle not signed in state -->
 *   </div>
 *
 *   <div v-else>
 *     <p>This session has been active since {{ session.lastActiveAt.toLocaleString() }}</p>
 *   </div>
 * </template>
 */
export const useSession: UseSession = () => {
  const { sessionCtx, clerk } = useClerkContext();

  const result = computed<UseSessionReturn>(() => {
    if (sessionCtx.value === undefined) {
      return { isLoaded: false, isSignedIn: undefined, session: undefined };
    }

    const isSignedOut = sessionCtx.value === null;
    if (isSignedOut) {
      return { isLoaded: true, isSignedIn: false, session: null };
    }

    return { isLoaded: true, isSignedIn: !!clerk.value?.isSignedIn, session: sessionCtx.value };
  });

  return toComputedRefs(result);
};
