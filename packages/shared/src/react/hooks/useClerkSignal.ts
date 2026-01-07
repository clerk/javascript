'use client';

import { useCallback, useSyncExternalStore } from 'react';

import { eventMethodCalled } from '../../telemetry';
import type { SignalName, SignInSignalValue, SignUpSignalValue, WaitlistSignalValue } from '../../types';
import { useClerkInstanceContext, useAssertWrappedByClerkProvider } from '../contexts';

/**
 * Return type map for signal hooks.
 */
type SignalValueMap = {
  signIn: SignInSignalValue;
  signUp: SignUpSignalValue;
  waitlist: WaitlistSignalValue;
};

function useClerkSignal<T extends SignalName>(signalName: T): SignalValueMap[T] {
  useAssertWrappedByClerkProvider('useClerkSignal');

  const clerk = useClerkInstanceContext();

  // Record telemetry for specific hooks
  if (signalName === 'signIn') {
    clerk.telemetry?.record(eventMethodCalled('useSignIn', { apiVersion: '2025-11' }));
  } else if (signalName === 'signUp') {
    clerk.telemetry?.record(eventMethodCalled('useSignUp', { apiVersion: '2025-11' }));
  }

  const subscribe = useCallback(
    (callback: () => void) => {
      if (!clerk.loaded) {
        return () => {};
      }

      return clerk.__internal_state.__internal_effect(() => {
        // Use getSignal for dynamic lookup instead of switch
        const signal = clerk.__internal_state.getSignal(signalName);
        if (signal) {
          signal();
        }
        callback();
      });
    },
    [clerk, clerk.loaded, clerk.__internal_state, signalName],
  );

  const getSnapshot = useCallback(() => {
    // Use getSignal for dynamic lookup instead of switch
    const signal = clerk.__internal_state.getSignal(signalName);
    if (!signal) {
      throw new Error(`Unknown signal: ${signalName}`);
    }
    return signal() as SignalValueMap[T];
  }, [clerk.__internal_state, signalName]);

  const value = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  return value;
}

/**
 * Creates a signal hook for a given signal name.
 * This factory enables one-liner hook creation from signal names.
 */
export function createSignalHook<T extends SignalName>(name: T): () => SignalValueMap[T] {
  return () => useClerkSignal(name);
}

/**
 * This hook allows you to access the Signal-based `SignIn` resource.
 *
 * @example
 * import { useSignIn } from "@clerk/react/experimental";
 *
 * function SignInForm() {
 *   const { signIn, errors, fetchStatus } = useSignIn();
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
 * import { useSignUp } from "@clerk/react/experimental";
 *
 * function SignUpForm() {
 *   const { signUp, errors, fetchStatus } = useSignUp();
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
