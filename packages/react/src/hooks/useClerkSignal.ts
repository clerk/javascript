import type { SignInSignalValue, SignUpSignalValue } from '@clerk/types';
import { useCallback, useSyncExternalStore } from 'react';

import { useIsomorphicClerkContext } from '../contexts/IsomorphicClerkContext';
import { useAssertWrappedByClerkProvider } from './useAssertWrappedByClerkProvider';

function useClerkSignal(signal: 'signIn'): SignInSignalValue;
function useClerkSignal(signal: 'signUp'): SignUpSignalValue;
function useClerkSignal(signal: 'signIn' | 'signUp'): SignInSignalValue | SignUpSignalValue {
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
        return clerk.__internal_state.signInSignal() as SignInSignalValue;
      case 'signUp':
        return clerk.__internal_state.signUpSignal() as SignUpSignalValue;
      default:
        throw new Error(`Unknown signal: ${signal}`);
    }
  }, [clerk.__internal_state]);

  const value = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return value;
}

/**
 * This hook allows you to access the Signal-based `SignIn` resource.
 *
 * @experimental This experimental API is subject to change.
 * @example
 * import { useSignInSignal } from "@clerk/clerk-react/experimental";
 *
 * function SignInForm() {
 *   const { signIn, errors, fetchStatus } = useSignInSignal();
 *   //
 * }
 */
export function useSignInSignal() {
  return useClerkSignal('signIn');
}

/**
 * This hook allows you to access the Signal-based `SignUp` resource.
 *
 * @experimental This experimental API is subject to change.
 * @example
 * import { useSignUpSignal } from "@clerk/clerk-react/experimental";
 *
 * function SignUpForm() {
 *   const { signUp, errors, fetchStatus } = useSignUpSignal();
 *   //
 * }
 */
export function useSignUpSignal() {
  return useClerkSignal('signUp');
}
