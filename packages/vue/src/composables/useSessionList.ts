import type { UseSessionListReturn } from '@clerk/types';
import { computed } from 'vue';

import type { ToComputedRefs } from '../utils';
import { toComputedRefs } from '../utils';
import { useClerkContext } from './useClerkContext';

type UseSessionList = () => ToComputedRefs<UseSessionListReturn>;

/**
 * Returns an array of [`Session`](https://clerk.com/docs/references/javascript/session) objects that have been
 * registered on the client device.
 *
 * @example
 *
 * <script setup>
 * import { useSessionList } from '@clerk/vue'
 *
 * const { isLoaded, sessions } = useSessionList()
 * </script>
 *
 * <template>
 *   <div v-if="!isLoaded">
 *     <!-- Handle loading state -->
 *   </div>
 *
 *   <div v-else>
 *     <p>
 *       Welcome back. You have been here
 *       {{ sessions.length }} times before.
 *     </p>
 *   </div>
 * </template>
 */
export const useSessionList: UseSessionList = () => {
  const { clerk, clientCtx } = useClerkContext();

  const result = computed<UseSessionListReturn>(() => {
    if (!clientCtx.value) {
      return { isLoaded: false, sessions: undefined, setActive: undefined };
    }

    return {
      isLoaded: true,
      sessions: clientCtx.value.sessions,
      setActive: clerk.value!.setActive,
    };
  });

  return toComputedRefs(result);
};
