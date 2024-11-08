import { useClerkContext } from './useClerkContext';

/**
 * Returns the [`Clerk`](https://clerk.com/docs/references/javascript/clerk/clerk) instance which provides
 * low-level access to Clerk's functionality, enabling custom authentication UI and flows.
 *
 * @example
 *
 * <script setup>
 * import { useClerk } from '@clerk/vue'
 *
 * const clerk = useClerk()
 *
 * const openSignIn = () => clerk.value.openSignIn()
 * </script>
 *
 * <template>
 *   <button @click="openSignIn">Sign in</button>
 * </template>
 */
export const useClerk = () => {
  const { clerk } = useClerkContext();

  return clerk;
};
