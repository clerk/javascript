import { SignUpResource } from '@clerk/types';

import { useClientContext } from '../contexts/ClientContext';

type UseSignUpReturn =
  | { isLoaded: false; signUp: null }
  | { isLoaded: true; signUp: SignUpResource };

type UseSignUp = () => UseSignUpReturn;

export const useSignUp: UseSignUp = () => {
  const client = useClientContext();

  if (!client) {
    return { isLoaded: false, signUp: null };
  }

  return { isLoaded: true, signUp: client.signUp };
};
