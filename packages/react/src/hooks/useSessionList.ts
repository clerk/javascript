import { SessionResource, SetSession } from '@clerk/types';

import { useClientContext } from '../contexts/ClientContext';
import { useIsomorphicClerkContext } from '../contexts/IsomorphicClerkContext';

type UseSessionListReturn =
  | { isLoaded: false; sessions: undefined; setSession: undefined }
  | { isLoaded: true; sessions: SessionResource[]; setSession: SetSession };

type UseSessionList = () => UseSessionListReturn;

export const useSessionList: UseSessionList = () => {
  const isomorphicClerk = useIsomorphicClerkContext();
  const client = useClientContext();

  if (!client) {
    return { isLoaded: false, sessions: undefined, setSession: undefined };
  }

  return { isLoaded: true, sessions: client.sessions, setSession: isomorphicClerk.setSession };
};
