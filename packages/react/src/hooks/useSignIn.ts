import { useClientContext } from '@clerk/shared/react';
import { eventMethodCalled } from '@clerk/shared/telemetry';
import type { UseSignInReturn } from '@clerk/types';

import { useIsomorphicClerkContext } from '../contexts/IsomorphicClerkContext';
import { useAssertWrappedByClerkProvider } from './useAssertWrappedByClerkProvider';

/**
 * The `useSignIn()` hook provides access to the [`SignIn`](https://clerk.com/docs/reference/javascript/sign-in) object, which allows you to check the current state of a sign-in attempt and manage the sign-in flow. You can use this to create a [custom sign-in flow](https://clerk.com/docs/guides/development/custom-flows/overview#sign-in-flow).
 *
 * @unionReturnHeadings
 * ["Initialization", "Loaded"]
 */
export const useSignIn = (): UseSignInReturn => {
  useAssertWrappedByClerkProvider('useSignIn');

  const isomorphicClerk = useIsomorphicClerkContext();
  const client = useClientContext();

  isomorphicClerk.telemetry?.record(eventMethodCalled('useSignIn'));

  if (!client) {
    return { isLoaded: false, signIn: undefined, setActive: undefined };
  }

  return {
    isLoaded: true,
    signIn: client.signIn,
    setActive: isomorphicClerk.setActive,
  };
};
