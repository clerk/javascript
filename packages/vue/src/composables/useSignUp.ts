import { eventMethodCalled } from '@clerk/shared/telemetry';
import type { UseSignUpReturn } from '@clerk/shared/types';
import { computed, watch } from 'vue';

import type { ToComputedRefs } from '../utils';
import { toComputedRefs } from '../utils';
import { useClerkContext } from './useClerkContext';

type UseSignUp = () => ToComputedRefs<UseSignUpReturn>;

/**
 * Returns the current [`SignUp`](https://clerk.com/docs/reference/javascript/sign-up) object which provides
 * methods and state for managing the sign-up flow.
 *
 * @example
 * <script setup>
 * import { useSignUp } from '@clerk/vue'
 *
 * const { isLoaded, signUp } = useSignUp()
 * </script>
 *
 * <template>
 *   <div v-if="!isLoaded">
 *     <!-- Handle loading state -->
 *   </div>
 *
 *   <div v-else>
 *     The current sign-up attempt status is {{ signUp.status }}.
 *   </div>
 * </template>
 */
export const useSignUp: UseSignUp = () => {
  const { clerk, clientCtx } = useClerkContext('useSignUp');

  const unwatch = watch(clerk, value => {
    if (value) {
      value.telemetry?.record(eventMethodCalled('useSignUp'));
      unwatch();
    }
  });

  const result = computed<UseSignUpReturn>(() => {
    if (!clerk.value || !clientCtx.value) {
      return { isLoaded: false, signUp: undefined, setActive: undefined };
    }

    return {
      isLoaded: true,
      signUp: clientCtx.value.signUp,
      setActive: clerk.value.setActive,
    };
  });

  return toComputedRefs(result);
};
