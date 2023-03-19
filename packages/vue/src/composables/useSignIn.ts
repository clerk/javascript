import type { SetActive, SetSession, SignInResource } from '@clerk/types';
import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { useClerkProvide } from '../injection';

type UseSignInReturn =
  | { isLoaded: false; signIn: undefined; setSession: undefined; setActive: undefined }
  | { isLoaded: true; signIn: SignInResource; setSession: SetSession; setActive: SetActive };

type UseSignIn = () => ComputedRef<UseSignInReturn>;

export const useSignIn: UseSignIn = () => {
  const { clerk, clerkLoaded } = useClerkProvide();
  return computed(() => {
    if (!clerkLoaded.value || !clerk.client) {
      return { isLoaded: false, signIn: undefined, setSession: undefined, setActive: undefined };
    }

    return {
      isLoaded: true,
      signIn: clerk.client.signIn,
      setSession: clerk.setSession,
      setActive: clerk.setActive,
    };
  });
};
