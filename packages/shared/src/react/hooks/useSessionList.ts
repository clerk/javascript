import type { UseSessionListReturn } from '@clerk/types';

import { useAssertWrappedByClerkProvider, useClerkInstanceContext, useClientContext } from '../contexts';

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
