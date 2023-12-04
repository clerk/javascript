import type { SessionResource, SetActive } from '@clerk/types';

import { useClerkInstanceContext, useClientContext } from '../contexts';

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
