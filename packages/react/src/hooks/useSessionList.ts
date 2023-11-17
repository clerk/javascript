import type { SessionResource, SetActive } from '@clerk/types';

import { useClientContext } from '../contexts/ClientContext';
import { useIsomorphicClerkContext } from '../contexts/IsomorphicClerkContext';

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
  const isomorphicClerk = useIsomorphicClerkContext();
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
