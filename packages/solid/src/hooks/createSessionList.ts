import type { SessionResource, SetActive, SetSession } from '@clerk/types';
import type { Accessor } from 'solid-js';

import { useClientContext } from '../contexts/ClientContext';
import { useIsomorphicClerkContext } from '../contexts/IsomorphicClerkContext';

type UseSessionListReturn =
  | { isLoaded: false; sessions: undefined; setSession: undefined; setActive: undefined }
  | { isLoaded: true; sessions: SessionResource[]; setSession: SetSession; setActive: SetActive };

type CreateSessionList = () => Accessor<UseSessionListReturn>;

export const createSessionList: CreateSessionList = () => {
  const isomorphicClerk = useIsomorphicClerkContext();
  const client = useClientContext();

  return () => {
    const c = client();
    if (!c) {
      return { isLoaded: false, sessions: undefined, setSession: undefined, setActive: undefined };
    }
    return {
      isLoaded: true,
      sessions: c.sessions,
      setSession: isomorphicClerk().setSession,
      setActive: isomorphicClerk().setActive,
    };
  };
};
