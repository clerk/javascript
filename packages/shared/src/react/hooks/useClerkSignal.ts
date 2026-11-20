import { useCallback, useSyncExternalStore } from 'react';

import type { SignInSignalValue, SignUpSignalValue, WaitlistSignalValue } from '../../types';
import { useAssertWrappedByClerkProvider, useClerkInstanceContext } from '../contexts';

export function __internal_useClerkSignal(signal: 'signIn'): SignInSignalValue;
export function __internal_useClerkSignal(signal: 'signUp'): SignUpSignalValue;
export function __internal_useClerkSignal(signal: 'waitlist'): WaitlistSignalValue;
export function __internal_useClerkSignal(
  signal: 'signIn' | 'signUp' | 'waitlist',
): SignInSignalValue | SignUpSignalValue | WaitlistSignalValue;
export function __internal_useClerkSignal(
  signal: 'signIn' | 'signUp' | 'waitlist',
): SignInSignalValue | SignUpSignalValue | WaitlistSignalValue {
  useAssertWrappedByClerkProvider('useClerkSignal');

  const clerk = useClerkInstanceContext();

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

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
