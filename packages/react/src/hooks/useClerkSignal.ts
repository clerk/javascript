import { useCallback, useSyncExternalStore } from 'react';

import { useIsomorphicClerkContext } from '../contexts/IsomorphicClerkContext';
import { useAssertWrappedByClerkProvider } from './useAssertWrappedByClerkProvider';

function useClerkSignal(signal: 'signIn') {
  useAssertWrappedByClerkProvider('useSignInSignal');

  const clerk = useIsomorphicClerkContext();

  const subscribe = useCallback(
    (callback: () => void) => {
      if (!clerk.loaded || !clerk.__internal_state) {
        return () => {};
      }

      return clerk.__internal_state.__internal_effect(() => {
        switch (signal) {
          case 'signIn':
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- we know that the state is defined
            clerk.__internal_state!.signInSignal();
            break;
          default:
            throw new Error(`Unknown signal: ${signal}`);
        }
        callback();
      });
    },
    [clerk, clerk.loaded, clerk.__internal_state],
  );
  const getSnapshot = useCallback(() => {
    if (!clerk.__internal_state) {
      return null;
    }

    switch (signal) {
      case 'signIn':
        return clerk.__internal_state.signInSignal();
      default:
        throw new Error(`Unknown signal: ${signal}`);
    }
  }, [clerk.__internal_state]);

  const value = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return value;
}

export function useSignInSignal() {
  return useClerkSignal('signIn');
}
