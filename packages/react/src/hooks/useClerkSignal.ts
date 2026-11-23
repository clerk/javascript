import { __internal_useClerkSignal } from '@clerk/shared/react';
import { eventMethodCalled } from '@clerk/shared/telemetry';
import type { SignInSignalValue, SignUpSignalValue, WaitlistSignalValue } from '@clerk/shared/types';

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

  return __internal_useClerkSignal(signal);
}

/**
 * This hook allows you to access the Signal-based `SignIn` resource.
 *
 * @example
 * import { useSignIn } from "@clerk/react";
 *
 * function SignInForm() {
 *   const { signIn, errors, fetchStatus } = useSignIn();
 *   //
 * }
 */
export const useSignIn = (): SignInSignalValue => {
  return useClerkSignal('signIn');
};

/**
 * This hook allows you to access the Signal-based `SignUp` resource.
 *
 * @example
 * import { useSignUp } from "@clerk/react";
 *
 * function SignUpForm() {
 *   const { signUp, errors, fetchStatus } = useSignUp();
 *   //
 * }
 */
export const useSignUp = (): SignUpSignalValue => {
  return useClerkSignal('signUp');
};

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
 */
export function useWaitlist() {
  return useClerkSignal('waitlist');
}
