import { SignInResource } from '@clerk/types';

import { useClientContext } from '../contexts/ClientContext';

type UseSignInReturn =
  | { isLoaded: false; signIn: undefined }
  | { isLoaded: true; signIn: SignInResource };

type UseSignIn = () => UseSignInReturn;

export const useSignIn: UseSignIn = () => {
  const client = useClientContext();

  if (!client) {
    return { isLoaded: false, signIn: undefined };
  }

  return { isLoaded: true, signIn: client.signIn };
};
