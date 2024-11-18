import { useClientContext } from '@clerk/shared/react';
import { eventMethodCalled } from '@clerk/shared/telemetry';
import type { UseSignUpReturn } from '@clerk/types';

import { useIsomorphicClerkContext } from '../contexts/IsomorphicClerkContext';
import { useAssertWrappedByClerkProvider } from './useAssertWrappedByClerkProvider';

type UseSignUp = () => UseSignUpReturn;

export const useSignUp: UseSignUp = () => {
  useAssertWrappedByClerkProvider('useSignUp');

  const isomorphicClerk = useIsomorphicClerkContext();
  const client = useClientContext();

  isomorphicClerk.telemetry?.record(eventMethodCalled('useSignUp'));

  if (!client) {
    return { isLoaded: false, signUp: undefined, setActive: undefined };
  }

  return {
    isLoaded: true,
    signUp: client.signUp,
    setActive: isomorphicClerk.setActive,
  };
};
