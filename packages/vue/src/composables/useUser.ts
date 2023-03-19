import type { UserResource } from '@clerk/types';
import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { useClerkProvide } from '../injection';

type UseUserReturn =
  | { isLoaded: false; isSignedIn: undefined; user: undefined }
  | { isLoaded: true; isSignedIn: false; user: null }
  | { isLoaded: true; isSignedIn: true; user: UserResource };

export function useUser(): ComputedRef<UseUserReturn> {
  const { derivedState } = useClerkProvide();

  return computed(() => {
    const { user } = derivedState.value;

    if (user === undefined) {
      return { isLoaded: false, isSignedIn: undefined, user: undefined };
    }

    if (user === null) {
      return { isLoaded: true, isSignedIn: false, user: null };
    }

    return { isLoaded: true, isSignedIn: true, user };
  });
}
