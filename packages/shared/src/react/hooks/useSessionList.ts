import type { SessionResource, SetActive } from '@clerk/types';

import { useAssertWrappedByClerkProvider, useClerkInstanceContext, useClientContext } from '../contexts.js';

type UseSessionListReturn =
  | {
      isLoaded: false;
      sessions: undefined;
      setActive: undefined;
    }
  | {
      isLoaded: true;
      sessions: SessionResource[];
      setActive: SetActive;
    };

type UseSessionList = () => UseSessionListReturn;

export const useSessionList: UseSessionList = () => {
  useAssertWrappedByClerkProvider('useSessionList');

  const isomorphicClerk = useClerkInstanceContext();
  const client = useClientContext();

  if (!client) {
    return { isLoaded: false, sessions: undefined, setActive: undefined };
  }

  return {
    isLoaded: true,
    sessions: client.sessions,
    setActive: isomorphicClerk.setActive,
  };
};
