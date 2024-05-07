import { useClientContext } from '@clerk/shared/react';
import { eventMethodCalled } from '@clerk/shared/telemetry';
import type { SetActive, SignInResource } from '@clerk/types';

import { useIsomorphicClerkContext } from '../contexts/IsomorphicClerkContext';
import { useAssertWrappedByClerkProvider } from './useAssertWrappedByClerkProvider';

type UseSignInReturn =
  | {
      isLoaded: false;
      signIn: undefined;
      setActive: undefined;
    }
  | {
      isLoaded: true;
      signIn: SignInResource;
      setActive: SetActive;
    };

type UseSignIn = () => UseSignInReturn;

export const useSignIn: UseSignIn = () => {
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
