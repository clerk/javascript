import { useCallback, useSyncExternalStore } from 'react';

import type { SignedInSessionResource } from '@/types';

import { useClerkInstanceContext, useInitialStateContext } from '../../contexts';

export function useSessionBase(): SignedInSessionResource | null | undefined {
  const clerk = useClerkInstanceContext();
  const initialState = useInitialStateContext();
  const getInitialState = useCallback(() => initialState?.session as SignedInSessionResource, [initialState?.session]);

  const session = useSyncExternalStore(
    useCallback(callback => clerk.addListener(callback, { skipInitialEmit: true }), [clerk]),
    useCallback(() => {
      if (!clerk.loaded) {
        return getInitialState();
      }
      return clerk.session;
    }, [clerk, getInitialState]),
    getInitialState,
  );

  return session;
}
