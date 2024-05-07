import { useClientContext } from '@clerk/shared/react';
import { eventMethodCalled } from '@clerk/shared/telemetry';
import type { SetActive, SignUpResource } from '@clerk/types';
import { useEffect } from 'react';

import { useIsomorphicClerkContext } from '../contexts/IsomorphicClerkContext';
import { useAssertWrappedByClerkProvider } from './useAssertWrappedByClerkProvider';

type UseSignUpReturn =
  | {
      isLoaded: false;
      signUp: undefined;
      setActive: undefined;
    }
  | {
      isLoaded: true;
      signUp: SignUpResource;
      setActive: SetActive;
    };

type UseSignUp = () => UseSignUpReturn;

export const useSignUp: UseSignUp = () => {
  useAssertWrappedByClerkProvider('useSignUp');

  const isomorphicClerk = useIsomorphicClerkContext();
  const client = useClientContext();

  useEffect(() => {
    isomorphicClerk.telemetry?.record(eventMethodCalled('useSignUp'));
  }, [isomorphicClerk.telemetry]);

  if (!client) {
    return { isLoaded: false, signUp: undefined, setActive: undefined };
  }

  return {
    isLoaded: true,
    signUp: client.signUp,
    setActive: isomorphicClerk.setActive,
  };
};
