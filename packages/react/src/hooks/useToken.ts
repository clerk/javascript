import type { SessionTokenSignalValue } from '@clerk/shared/types';
import { useCallback, useSyncExternalStore } from 'react';

import { useIsomorphicClerkContext } from '../contexts/IsomorphicClerkContext';
import { useAssertWrappedByClerkProvider } from './useAssertWrappedByClerkProvider';

const useToken = (): SessionTokenSignalValue => {
  useAssertWrappedByClerkProvider('__internal_useToken');

  const clerk = useIsomorphicClerkContext();

  const subscribe = useCallback(
    (callback: () => void) => {
      if (!clerk.loaded) {
        return () => {};
      }

      return clerk.__internal_state.__internal_effect(() => {
        clerk.__internal_state.sessionTokenSignal();
        callback();
      });
    },
    [clerk],
  );

  const getSnapshot = useCallback(() => {
    return clerk.__internal_state.sessionTokenSignal();
  }, [clerk]);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
};

export { useToken as __internal_useToken };
