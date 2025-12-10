import { useClerk } from '@clerk/shared/react';
import type { UserResource } from '@clerk/shared/types';

type UseMultipleSessionsParam = {
  user: UserResource | null | undefined;
};

const useMultipleSessions = (params: UseMultipleSessionsParam) => {
  const clerk = useClerk();
  const signedInSessions = clerk.client.signedInSessions;

  return {
    signedInSessions,
    otherSessions: signedInSessions.filter(s => s.user?.id !== params.user?.id),
  };
};

export { useMultipleSessions };
