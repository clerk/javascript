import { useCallback, useSyncExternalStore } from 'react';

import { deriveFromSsrInitialState } from '@/deriveState';
import type { SignedInSessionResource } from '@/types';

import { useClerkInstanceContext, useInitialStateContext } from '../../contexts';

export function useSessionBase(): SignedInSessionResource | null | undefined {
  const clerk = useClerkInstanceContext();
  const initialState = useInitialStateContext();
  const getInitialState = useCallback(() => {
    return initialState ? deriveFromSsrInitialState(initialState)?.session : undefined;
  }, [initialState]);

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
