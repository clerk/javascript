import { SetActive, SetSession, SignInResource } from '@clerk/types';

import { useClientContext } from '../contexts/ClientContext';
import { useIsomorphicClerkContext } from '../contexts/IsomorphicClerkContext';

type UseSignInReturn =
  | { isLoaded: false; signIn: undefined; setSession: undefined; setActive: undefined }
  | { isLoaded: true; signIn: SignInResource; setSession: SetSession; setActive: SetActive };

type UseSignIn = () => UseSignInReturn;

export const useSignIn: UseSignIn = () => {
  const isomorphicClerk = useIsomorphicClerkContext();
  const client = useClientContext();

  if (!client) {
    return { isLoaded: false, signIn: undefined, setSession: undefined, setActive: undefined };
  }

  return {
    isLoaded: true,
    signIn: client.signIn,
    setSession: isomorphicClerk.setSession,
    setActive: isomorphicClerk.setActive,
  };
};
