import { SessionResource } from '@clerk/types';

import { useClientContext } from '../contexts/ClientContext';

type UseSessionListReturn =
  | { isLoaded: false; sessions: undefined }
  | { isLoaded: true; sessions: SessionResource[] };

type UseSessionList = () => UseSessionListReturn;

export const useSessionList: UseSessionList = () => {
  const client = useClientContext();

  if (!client) {
    return { isLoaded: false, sessions: undefined };
  }

  return { isLoaded: true, sessions: client.sessions };
};
