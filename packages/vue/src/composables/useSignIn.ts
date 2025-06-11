import { eventMethodCalled } from '@clerk/shared/telemetry';
import type { SetActive,SignInResource, UseSignInReturn } from '@clerk/types';
import { computed, watch } from 'vue';

import type { ToComputedRefs } from '../utils';
import { toComputedRefs } from '../utils';
import { useClerkContext } from './useClerkContext';

type UseSignIn = () => ToComputedRefs<UseSignInReturn>;

/**
 * A deferred proxy type that represents a resource that is not yet available
 * but will be hydrated once Clerk is loaded. This prevents unsafe type casting
 * and provides proper static typing for methods that return Promises.
 */
type Deferred<T> = {
  [K in keyof T]: T[K] extends (...args: infer Args) => Promise<infer Return>
    ? (...args: Args) => Promise<Return>
    : T[K] extends (...args: infer Args) => infer Return
    ? (...args: Args) => Promise<Return>
    : T[K];
};

type DeferredUseSignInReturn = {
  isLoaded: true;
  signIn: Deferred<SignInResource>;
  setActive: Deferred<SetActive>;
};

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

  const result = computed<UseSignInReturn | DeferredUseSignInReturn>(() => {
    if (!clerk.value || !clientCtx.value) {
      // Create proxy objects that queue calls until clerk loads
      const createProxy = <T>(target: 'signIn' | 'setActive'): Deferred<T> => {
        return new Proxy({}, {
          get(_, prop) {
            // Prevent Vue from treating this proxy as a Promise by returning undefined for 'then'
            if (prop === 'then') {
              return undefined;
            }
            
            // Handle Symbol properties and other non-method properties
            if (typeof prop === 'symbol' || typeof prop !== 'string') {
              return undefined;
            }

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
          has(_, prop) {
            // Return false for 'then' to prevent Promise-like behavior
            if (prop === 'then') {
              return false;
            }
            // Return true for all other properties to indicate they exist on the proxy
            return true;
          },
        }) as Deferred<T>;
      };

      return {
        isLoaded: true,
        signIn: createProxy<SignInResource>('signIn'),
        setActive: createProxy<SetActive>('setActive'),
      } satisfies DeferredUseSignInReturn;
    }

    return {
      isLoaded: true,
      signIn: clientCtx.value.signIn,
      setActive: clerk.value.setActive,
    } satisfies UseSignInReturn;
  });

  return toComputedRefs(result as any);
};
