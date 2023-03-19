import type { ActiveSessionResource } from '@clerk/types';
import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { useClerkProvide } from '../injection';

type UseSessionReturn =
  | { isLoaded: false; isSignedIn: undefined; session: undefined }
  | { isLoaded: true; isSignedIn: false; session: null }
  | { isLoaded: true; isSignedIn: true; session: ActiveSessionResource };

type UseSession = () => ComputedRef<UseSessionReturn>;

export const useSession: UseSession = () => {
  const { derivedState } = useClerkProvide();

  return computed(() => {
    const { session } = derivedState.value;

    if (session === undefined) {
      return { isLoaded: false, isSignedIn: undefined, session: undefined };
    }

    if (session === null) {
      return { isLoaded: true, isSignedIn: false, session: null };
    }

    return { isLoaded: true, isSignedIn: true, session };
  });
};
