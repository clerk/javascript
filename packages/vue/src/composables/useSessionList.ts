import type { SessionResource, SetActive, SetSession } from '@clerk/types';
import type { ComputedRef } from 'vue';
import { computed } from 'vue';

import { useClerkProvide } from '../injection';

type UseSessionListReturn =
  | { isLoaded: false; sessions: undefined; setSession: undefined; setActive: undefined }
  | { isLoaded: true; sessions: SessionResource[]; setSession: SetSession; setActive: SetActive };

type UseSessionList = () => ComputedRef<UseSessionListReturn>;

export const useSessionList: UseSessionList = () => {
  const { clerk, clerkLoaded } = useClerkProvide();
  return computed(() => {
    if (!clerkLoaded.value || !clerk.client) {
      return { isLoaded: false, sessions: undefined, setSession: undefined, setActive: undefined };
    }

    return {
      isLoaded: true,
      sessions: clerk.client.sessions,
      setSession: clerk.setSession,
      setActive: clerk.setActive,
    };
  });
};
