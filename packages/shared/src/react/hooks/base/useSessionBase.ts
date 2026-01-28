import { useCallback, useSyncExternalStore } from 'react';

import type { SignedInSessionResource } from '@/types';

import { useClerkInstanceContext, useInitialStateContext } from '../../contexts';

export function useSessionBase(): SignedInSessionResource | null | undefined {
  const clerk = useClerkInstanceContext();
  const initialState = useInitialStateContext();
  const getInitialState = useCallback(() => {
    return initialState?.session as SignedInSessionResource | undefined;
  }, [initialState?.session]);

  const session = useSyncExternalStore(
    useCallback(callback => clerk.addListener(callback, { skipInitialEmit: true }), [clerk]),
    useCallback(() => {
      if (!clerk.loaded || !clerk.__internal_lastEmittedResources) {
        return getInitialState();
      }
      return clerk.__internal_lastEmittedResources.session;
    }, [clerk, getInitialState]),
    getInitialState,
  );

  return session;
}
