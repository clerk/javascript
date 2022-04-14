import { SetSession, SignUpResource } from '@clerk/types';

import { useClientContext } from '../contexts/ClientContext';
import { useIsomorphicClerkContext } from '../contexts/IsomorphicClerkContext';

type UseSignUpReturn =
  | { isLoaded: false; signUp: undefined; setSession: undefined }
  | { isLoaded: true; signUp: SignUpResource; setSession: SetSession };

type UseSignUp = () => UseSignUpReturn;

export const useSignUp: UseSignUp = () => {
  const isomorphicClerk = useIsomorphicClerkContext();
  const client = useClientContext();

  if (!client) {
    return { isLoaded: false, signUp: undefined, setSession: undefined };
  }

  return { isLoaded: true, signUp: client.signUp, setSession: isomorphicClerk.setSession };
};
