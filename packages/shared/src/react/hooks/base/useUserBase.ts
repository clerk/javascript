import { useCallback, useSyncExternalStore } from 'react';

import type { UserResource } from '@/types';

import { useClerkInstanceContext, useInitialStateContext } from '../../contexts';

export function useUserBase(): UserResource | null | undefined {
  const clerk = useClerkInstanceContext();
  const initialState = useInitialStateContext();
  const getInitialState = useCallback(() => initialState?.user, [initialState?.user]);

  const user = useSyncExternalStore(
    useCallback(
      callback => {
        return clerk.addListener(callback, { skipInitialEmit: true });
      },
      [clerk],
    ),
    useCallback(() => {
      // DIAG: instrument userButton mount regression
      const fellBack = !clerk.loaded || !(clerk as any).__internal_lastEmittedResources;
      // eslint-disable-next-line no-console
      console.log('[CLERK_DIAG] useUserBase getSnapshot', {
        loaded: !!clerk.loaded,
        hasLastEmitted: !!(clerk as any).__internal_lastEmittedResources,
        emittedUserId: (clerk as any).__internal_lastEmittedResources?.user?.id,
        clerkUserId: (clerk as any).user?.id,
        sessionId: (clerk as any).session?.id,
        fellBackToInitial: fellBack,
      });
      if (fellBack) {
        return getInitialState();
      }
      return (clerk as any).__internal_lastEmittedResources.user;
    }, [clerk, getInitialState]),
    getInitialState,
  );

  return user;
}
