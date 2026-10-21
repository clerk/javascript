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

  __internal_useClearQueriesOnSignOut({
    isSignedOut: user === null,
    authenticated,
    stableKeys: stableKey,
  });

  return __internal_useClerkQuery({
    queryKey,
    queryFn: () => user?.getSessions(),
    staleTime: 2 * 60_000,
    enabled: Boolean(user && session),
  });
}
