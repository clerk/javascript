import { eventMethodCalled } from '@clerk/shared/telemetry';
import type { UseSignInReturn } from '@clerk/types';
import { computed, watch } from 'vue';

import type { ToComputedRefs } from '../utils';
import { toComputedRefs } from '../utils';
import { useClerkContext } from './useClerkContext';

type UseSignIn = () => ToComputedRefs<UseSignInReturn>;

/**
 * Returns the current [`SignIn`](https://clerk.com/docs/references/javascript/sign-in) object which provides
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
 *   <div>
 *     The current sign in attempt status is {{ signIn.status }}.
 *   </div>
 * </template>
 */
export const useSignIn: UseSignIn = () => {
  const { clerk, clientCtx } = useClerkContext();

  const unwatch = watch(clerk, value => {
    if (value) {
      value.telemetry?.record(eventMethodCalled('useSignIn'));
      unwatch();
    }
  });

  const result = computed<UseSignInReturn>(() => {
    if (!clerk.value || !clientCtx.value) {
      // Create proxy objects that queue calls until clerk loads
      const createProxy = (target: 'signIn' | 'setActive') => {
        return new Proxy({}, {
          get(_, prop) {
            return (...args: any[]) => {
              return new Promise((resolve, reject) => {
                // Wait for next tick and try again
                setTimeout(() => {
                  if (clerk.value && clientCtx.value) {
                    const targetObj = target === 'setActive' ? clerk.value.setActive : clientCtx.value.signIn;
                    try {
                      const result = (targetObj as any)[prop](...args);
                      resolve(result);
                    } catch (error) {
                      reject(error);
                    }
                  } else {
                    reject(new Error('Clerk not loaded'));
                  }
                }, 0);
              });
            };
          },
        });
      };

      return {
        isLoaded: true,
        signIn: createProxy('signIn') as any,
        setActive: createProxy('setActive') as any,
      };
    }

    return {
      isLoaded: true,
      signIn: clientCtx.value.signIn,
      setActive: clerk.value.setActive,
    };
  });

  return toComputedRefs(result);
};
