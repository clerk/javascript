import {
  __internal_createCacheKeys,
  __internal_useClearQueriesOnSignOut,
  __internal_useClerkQuery,
  useSession,
  useUser,
} from '@clerk/shared/react';
import { useMemo } from 'react';

const USER_SESSIONS_KEY = 'mosaic-user-sessions';

export function useUserSessionsQuery() {
  const { user } = useUser();
  const { session } = useSession();
  const userId = user?.id ?? null;
  const sessionId = session?.id ?? null;

  const { queryKey, stableKey, authenticated } = useMemo(
    () =>
      __internal_createCacheKeys({
        stablePrefix: USER_SESSIONS_KEY,
        authenticated: true,
        tracked: { userId, sessionId },
        untracked: { args: {} },
      }),
    [userId, sessionId],
  );

  // Only runs while this hook is mounted, matching the shared hooks. Sign-out after unmount leaves the entry until it is garbage collected.
  __internal_useClearQueriesOnSignOut({
    isSignedOut: user === null,
    authenticated,
    stableKeys: stableKey,
  });

  return __internal_useClerkQuery({
    queryKey,
    // getSessions() also caches on the user, so a refetch only gets fresh data once the user resource is rebuilt.
    queryFn: () => user?.getSessions(),
    staleTime: 2 * 60_000,
    enabled: Boolean(user && session),
  });
}
