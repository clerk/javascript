import type { SetActive, SetSession, SignUpResource } from '@clerk/types';
import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { useClerkProvide } from '../injection';

type UseSignUpReturn =
  | { isLoaded: false; signUp: undefined; setSession: undefined; setActive: undefined }
  | { isLoaded: true; signUp: SignUpResource; setSession: SetSession; setActive: SetActive };

export function useSignUp(): ComputedRef<UseSignUpReturn> {
  const { clerk, clerkLoaded } = useClerkProvide();
  return computed(() => {
    if (!clerkLoaded.value || !clerk.client) {
      return { isLoaded: false, signUp: undefined, setSession: undefined, setActive: undefined };
    }

    return {
      isLoaded: true,
      signUp: clerk.client.signUp,
      setSession: clerk.setSession,
      setActive: clerk.setActive,
    };
  });
}
