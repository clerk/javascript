import type { SignInSignalValue, SignUpSignalValue } from '@clerk/shared/types';
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
 * @example
 * import { useSignInSignal } from "@clerk/react/experimental";
 *
 * function SignInForm() {
 *   const { signIn, errors, fetchStatus } = useSignInSignal();
 *   //
 * }
 *
 * @experimental This experimental API is subject to change.
 */
export function useSignIn() {
  return useClerkSignal('signIn');
}

/**
 * This hook allows you to access the Signal-based `SignUp` resource.
 *
 * @example
 * import { useSignUpSignal } from "@clerk/react/experimental";
 *
 * function SignUpForm() {
 *   const { signUp, errors, fetchStatus } = useSignUpSignal();
 *   //
 * }
 *
 * @experimental This experimental API is subject to change.
 */
export function useSignUp() {
  return useClerkSignal('signUp');
}
