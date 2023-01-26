import type { SetActive, SetSession, SignUpResource } from '@clerk/types';

import { useClientContext } from '../contexts/ClientContext';
import { useIsomorphicClerkContext } from '../contexts/IsomorphicClerkContext';

type UseSignUpReturn =
  | { isLoaded: false; signUp: undefined; setSession: undefined; setActive: undefined }
  | { isLoaded: true; signUp: SignUpResource; setSession: SetSession; setActive: SetActive };

type UseSignUp = () => UseSignUpReturn;

export const useSignUp: UseSignUp = () => {
  const isomorphicClerk = useIsomorphicClerkContext();
  const client = useClientContext();

  if (!client) {
    return { isLoaded: false, signUp: undefined, setSession: undefined, setActive: undefined };
  }

  return {
    isLoaded: true,
    signUp: client.signUp,
    setSession: isomorphicClerk.setSession,
    setActive: isomorphicClerk.setActive,
  };
};
