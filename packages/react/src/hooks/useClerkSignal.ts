import { eventMethodCalled } from '@clerk/shared/telemetry';
import type { SignInSignalValue, SignUpSignalValue, WaitlistSignalValue } from '@clerk/shared/types';
import { useCallback, useSyncExternalStore } from 'react';

import { useIsomorphicClerkContext } from '../contexts/IsomorphicClerkContext';
import { useAssertWrappedByClerkProvider } from './useAssertWrappedByClerkProvider';

function useClerkSignal(signal: 'signIn'): SignInSignalValue;
function useClerkSignal(signal: 'signUp'): SignUpSignalValue;
function useClerkSignal(signal: 'waitlist'): WaitlistSignalValue;
function useClerkSignal(
  signal: 'signIn' | 'signUp' | 'waitlist',
): SignInSignalValue | SignUpSignalValue | WaitlistSignalValue {
  useAssertWrappedByClerkProvider('useClerkSignal');

  const clerk = useIsomorphicClerkContext();

  switch (signal) {
    case 'signIn':
      clerk.telemetry?.record(eventMethodCalled('useSignIn', { apiVersion: '2025-11' }));
      break;
    case 'signUp':
      clerk.telemetry?.record(eventMethodCalled('useSignUp', { apiVersion: '2025-11' }));
      break;
    case 'waitlist':
      clerk.telemetry?.record(eventMethodCalled('useWaitlist', { apiVersion: '2025-11' }));
      break;
    default:
      break;
  }

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
          case 'waitlist':
            clerk.__internal_state.waitlistSignal();
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
      case 'waitlist':
        return clerk.__internal_state.waitlistSignal() as WaitlistSignalValue;
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
 * import { useSignIn } from "@clerk/react";
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
 * import { useSignUp } from "@clerk/react";
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
 * import { useWaitlist } from "@clerk/react";
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
