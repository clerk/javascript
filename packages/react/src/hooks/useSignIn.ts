import { SetSession, SignInResource } from '@clerk/types';

import { useClientContext } from '../contexts/ClientContext';
import { useIsomorphicClerkContext } from '../contexts/IsomorphicClerkContext';

type UseSignInReturn =
  | { isLoaded: false; signIn: undefined; setSession: undefined }
  | { isLoaded: true; signIn: SignInResource; setSession: SetSession };

type UseSignIn = () => UseSignInReturn;

export const useSignIn: UseSignIn = () => {
  const isomorphicClerk = useIsomorphicClerkContext();
  const client = useClientContext();

  if (!client) {
    return { isLoaded: false, signIn: undefined, setSession: undefined };
  }

  return { isLoaded: true, signIn: client.signIn, setSession: isomorphicClerk.setSession };
};
