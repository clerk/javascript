import { SignUpResource } from '@clerk/types';

import { useClientContext } from '../contexts/ClientContext';

type UseSignUpReturn =
  | { isLoaded: false; signUp: undefined }
  | { isLoaded: true; signUp: SignUpResource };

type UseSignUp = () => UseSignUpReturn;

export const useSignUp: UseSignUp = () => {
  const client = useClientContext();

  if (!client) {
    return { isLoaded: false, signUp: undefined };
  }

  return { isLoaded: true, signUp: client.signUp };
};
