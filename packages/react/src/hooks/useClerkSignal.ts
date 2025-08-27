import type { SignInSignal, SignUpSignal } from '@clerk/types';
import { useCallback, useSyncExternalStore } from 'react';

import { useIsomorphicClerkContext } from '../contexts/IsomorphicClerkContext';
import { useAssertWrappedByClerkProvider } from './useAssertWrappedByClerkProvider';

// These types are used to remove the `null` value from the underlying resource. This is safe because IsomorphicClerk
// always returns a valid resource, even before Clerk is loaded, and if Clerk is loaded, the resource is guaranteed to
// be non-null
type NonNullSignInSignal = Omit<ReturnType<SignInSignal>, 'signIn'> & {
  signIn: NonNullable<ReturnType<SignInSignal>['signIn']>;
};
type NonNullSignUpSignal = Omit<ReturnType<SignUpSignal>, 'signUp'> & {
  signUp: NonNullable<ReturnType<SignUpSignal>['signUp']>;
};

function useClerkSignal(signal: 'signIn'): NonNullSignInSignal;
function useClerkSignal(signal: 'signUp'): NonNullSignUpSignal;
function useClerkSignal(signal: 'signIn' | 'signUp'): NonNullSignInSignal | NonNullSignUpSignal {
  useAssertWrappedByClerkProvider('useClerkSignal');

  const clerk = useIsomorphicClerkContext();

  const subscribe = useCallback(
    (callback: () => void) => {
      if (!clerk.loaded) {
        return () => {};
      }

      return clerk.__internal_state.__internal_effect(() => {
        switch (signal) {
          case 'signIn':
            clerk.__internal_state.signInSignal();
            break;
          case 'signUp':
            clerk.__internal_state.signUpSignal();
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
    switch (signal) {
      case 'signIn':
        return clerk.__internal_state.signInSignal() as NonNullSignInSignal;
      case 'signUp':
        return clerk.__internal_state.signUpSignal() as NonNullSignUpSignal;
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
