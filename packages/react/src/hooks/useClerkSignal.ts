import type { SignInSignalValue, SignUpSignalValue, WaitlistSignalValue } from '@clerk/types';
import { useCallback, useMemo, useSyncExternalStore } from 'react';

import { useIsomorphicClerkContext } from '../contexts/IsomorphicClerkContext';
import { useAssertWrappedByClerkProvider } from './useAssertWrappedByClerkProvider';

type SignalName = 'signIn' | 'signUp' | 'waitlist';

function useClerkSignal(signal: 'signIn'): SignInSignalValue;
function useClerkSignal(signal: 'signUp'): SignUpSignalValue;
function useClerkSignal(signal: 'waitlist'): WaitlistSignalValue;
function useClerkSignal(signal: SignalName): SignInSignalValue | SignUpSignalValue | WaitlistSignalValue {
  useAssertWrappedByClerkProvider('useClerkSignal');

  const clerk = useIsomorphicClerkContext();

  const signalGetter = useMemo(() => {
    const map: Record<SignalName, () => SignInSignalValue | SignUpSignalValue | WaitlistSignalValue> = {
      signIn: () => clerk.__internal_state.signInSignal() as SignInSignalValue,
      signUp: () => clerk.__internal_state.signUpSignal() as SignUpSignalValue,
      waitlist: () => clerk.__internal_state.waitlistSignal() as WaitlistSignalValue,
    };
    return map[signal];
  }, [clerk.__internal_state, signal]);

  const subscribe = useCallback(
    (callback: () => void) => {
      if (!clerk.loaded) {
        return () => {};
      }

      return clerk.__internal_state.__internal_effect(() => {
        signalGetter();
        callback();
      });
    },
    [clerk, clerk.loaded, clerk.__internal_state, signalGetter],
  );

  const getSnapshot = useCallback(() => {
    return signalGetter();
  }, [signalGetter]);

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

/**
 * This hook allows you to access the Signal-based `Waitlist` resource.
 *
 * @example
 * import { useWaitlist } from "@clerk/react/experimental";
 *
 * function WaitlistForm() {
 *   const { waitlist, errors, fetchStatus } = useWaitlist();
 *   //
 * }
 *
 * @experimental This experimental API is subject to change.
 */
export function useWaitlist() {
  return useClerkSignal('waitlist');
}
