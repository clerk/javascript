import type { SignInSignal, SignUpSignal } from '@clerk/types';
import { useCallback, useSyncExternalStore } from 'react';

import { useIsomorphicClerkContext } from '../contexts/IsomorphicClerkContext';
import { useAssertWrappedByClerkProvider } from './useAssertWrappedByClerkProvider';

function useClerkSignal(signal: 'signIn'): ReturnType<SignInSignal> | null;
function useClerkSignal(signal: 'signUp'): ReturnType<SignUpSignal> | null;
function useClerkSignal(signal: 'signIn' | 'signUp'): ReturnType<SignInSignal> | ReturnType<SignUpSignal> | null {
  useAssertWrappedByClerkProvider('useClerkSignal');

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
          case 'signUp':
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- we know that the state is defined
            clerk.__internal_state!.signUpSignal();
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
      case 'signUp':
        return clerk.__internal_state.signUpSignal();
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

export function useSignUpSignal() {
  return useClerkSignal('signUp');
}
