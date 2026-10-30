import {
  __internal_createCacheKeys,
  __internal_useClerkQuery,
  __internal_usePersistentQueryCleanupOnSignOut,
  useSession,
  useUser,
} from '@clerk/shared/react';
import { useMemo } from 'react';

const USER_SESSIONS_KEY = 'mosaic-user-sessions';

export function useUserSessionsQuery() {
  const { user } = useUser();
  const { session } = useSession();
  const userId = user?.id;
  const sessionId = session?.id;

  const { queryKey, stableKey } = useMemo(
    () =>
      __internal_createCacheKeys({
        stablePrefix: USER_SESSIONS_KEY,
        authenticated: true,
        tracked: { userId, sessionId },
        untracked: { args: {} },
      }),
    [userId, sessionId],
  );

  __internal_usePersistentQueryCleanupOnSignOut(stableKey);

  return __internal_useClerkQuery({
    queryKey,
    // getSessions() also caches on the user, so a refetch only gets fresh data once the user resource is rebuilt.
    queryFn: () => user?.getSessions(),
    staleTime: 2 * 60_000,
    enabled: Boolean(user && session),
  });
}
