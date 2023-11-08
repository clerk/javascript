import type { SetActive, SignUpResource } from '@clerk/types';

import { useClientContext } from '../contexts/ClientContext';
import { useIsomorphicClerkContext } from '../contexts/IsomorphicClerkContext';

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
  const isomorphicClerk = useIsomorphicClerkContext();
  const client = useClientContext();

  if (!client) {
    return { isLoaded: false, signUp: undefined, setActive: undefined };
  }

  return {
    isLoaded: true,
    signUp: client.signUp,
    setActive: isomorphicClerk.setActive,
  };
};
