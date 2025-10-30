import type { UseUserReturn } from '@clerk/shared/types';
import { computed } from 'vue';

import type { ToComputedRefs } from '../utils';
import { toComputedRefs } from '../utils';
import { useClerkContext } from './useClerkContext';

type UseUser = () => ToComputedRefs<UseUserReturn>;

/**
 * Returns the current user's [`User`](https://clerk.com/docs/reference/javascript/user/user) object along with loading states.
 *
 * @example
 * <script setup>
 * import { useUser } from '@clerk/vue'
 *
 * const { isLoaded, isSignedIn, user } = useUser()
 * </script>
 *
 * <template>
 *   <div v-if="!isLoaded">
 *     <!-- Handle loading state -->
 *   </div>
 *
 *   <div v-else-if="isSignedIn">
 *     Hello {{ user.fullName }}!
 *   </div>
 *
 *   <div v-else>
 *     Not signed in
 *   </div>
 * </template>
 */
export const useUser: UseUser = () => {
  const { userCtx } = useClerkContext('useUser');

  const result = computed<UseUserReturn>(() => {
    if (userCtx.value === undefined) {
      return { isLoaded: false, isSignedIn: undefined, user: undefined };
    }

    if (userCtx.value === null) {
      return { isLoaded: true, isSignedIn: false, user: null };
    }

    return { isLoaded: true, isSignedIn: true, user: userCtx.value };
  });

  return toComputedRefs(result);
};
