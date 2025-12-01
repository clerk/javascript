import { useCallback, useMemo, useSyncExternalStore } from 'react';

import type { UserResource } from '@/types';

import { useClerkInstanceContext, useInitialStateContext } from '../../contexts';

export function useUserBase(): UserResource | null | undefined {
  const clerk = useClerkInstanceContext();
  const initialStateContext = useInitialStateContext();
  // If we make initialState support a promise in the future, this is where we would use() that promise
  const initialSnapshot = useMemo(() => {
    if (!initialStateContext) {
      return undefined;
    }
    return initialStateContext.user;
  }, [initialStateContext]);

  const user = useSyncExternalStore(
    useCallback(
      callback => {
        return clerk.addListener(callback, { skipInitialEmit: true });
      },
      [clerk],
    ),
    useCallback(() => {
      if (!clerk.loaded) {
        return initialSnapshot;
      }
      return clerk.user;
    }, [clerk.user, initialSnapshot, clerk.loaded]),
    useCallback(() => initialSnapshot, [initialSnapshot]),
  );

  return user;
}
