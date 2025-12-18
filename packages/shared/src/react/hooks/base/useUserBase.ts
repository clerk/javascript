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
      if (!clerk.loaded) {
        return getInitialState();
      }
      return clerk.user;
    }, [clerk, getInitialState]),
    getInitialState,
  );

  return user;
}
