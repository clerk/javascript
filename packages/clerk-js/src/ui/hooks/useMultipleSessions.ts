import { useSessionList } from '@clerk/shared/react';
import type { ActiveSessionResource, UserResource } from '@clerk/types';

type UseMultipleSessionsParam = {
  user: UserResource | null | undefined;
};

const useMultipleSessions = (params: UseMultipleSessionsParam) => {
  const { sessions } = useSessionList();
  const activeSessions = sessions?.filter(s => s.status === 'active') as ActiveSessionResource[];
  const otherSessions = activeSessions.filter(s => s.user?.id !== params.user?.id);

  return {
    activeSessions,
    otherSessions,
  };
};

export { useMultipleSessions };
