import { useClerk } from '@clerk/shared/react';
import type { UserResource } from '@clerk/types';

type UseMultipleSessionsParam = {
  user: UserResource | null | undefined;
};

const useMultipleSessions = (params: UseMultipleSessionsParam) => {
  const clerk = useClerk();

  return {
    authenticatedSessions: clerk.client.authenticatedSessions,
    otherSessions: clerk.client.authenticatedSessions.filter(s => s.user?.id !== params.user?.id),
  };
};

export { useMultipleSessions };
