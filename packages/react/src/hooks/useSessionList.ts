import { SetActive, SessionResource, SetSession } from '@clerk/types';

import { useClientContext } from '../contexts/ClientContext';
import { useIsomorphicClerkContext } from '../contexts/IsomorphicClerkContext';

type UseSessionListReturn =
  | { isLoaded: false; sessions: undefined; setSession: undefined; setActive: undefined }
  | { isLoaded: true; sessions: SessionResource[]; setSession: SetSession; setActive: SetActive };

type UseSessionList = () => UseSessionListReturn;

export const useSessionList: UseSessionList = () => {
  const isomorphicClerk = useIsomorphicClerkContext();
  const client = useClientContext();

  if (!client) {
    return { isLoaded: false, sessions: undefined, setSession: undefined, setActive: undefined };
  }

  return {
    isLoaded: true,
    sessions: client.sessions,
    setSession: isomorphicClerk.setSession,
    setActive: isomorphicClerk.setActive,
  };
};
