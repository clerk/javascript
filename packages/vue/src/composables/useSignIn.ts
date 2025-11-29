import { eventMethodCalled } from '@clerk/shared/telemetry';
import type { UseSignInReturn } from '@clerk/shared/types';
import { computed, watch } from 'vue';

import type { ToComputedRefs } from '../utils';
import { toComputedRefs } from '../utils';
import { useClerkContext } from './useClerkContext';

type UseSignIn = () => ToComputedRefs<UseSignInReturn>;

/**
 * Returns the current [`SignIn`](https://clerk.com/docs/reference/javascript/sign-in) object which provides
 * methods and state for managing the sign-in flow.
 *
 * @example
 * <script setup>
 * import { useSignIn } from '@clerk/vue'
 *
 * const { isLoaded, signIn } = useSignIn()
 * </script>
 *
 * <template>
 *   <div v-if="!isLoaded">
 *     <!-- Handle loading state -->
 *   </div>
 *
 *   <div v-else>
 *     The current sign in attempt status is {{ signIn.status }}.
 *   </div>
 * </template>
 */
export const useSignIn: UseSignIn = () => {
  const { clerk, clientCtx } = useClerkContext('useSignIn');

  const unwatch = watch(clerk, value => {
    if (value) {
      value.telemetry?.record(eventMethodCalled('useSignIn'));
      unwatch();
    }
  });

  const result = computed<UseSignInReturn>(() => {
    if (!clerk.value || !clientCtx.value) {
      return { isLoaded: false, signIn: undefined, setActive: undefined };
    }

    return {
      isLoaded: true,
      signIn: clientCtx.value.signIn,
      setActive: clerk.value.setActive,
    };
  });

  return toComputedRefs(result);
};
