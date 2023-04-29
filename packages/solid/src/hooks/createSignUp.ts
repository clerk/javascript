import type { SetActive, SetSession, SignUpResource } from '@clerk/types';
import type { Accessor } from 'solid-js';

import { useClientContext } from '../contexts/ClientContext';
import { useIsomorphicClerkContext } from '../contexts/IsomorphicClerkContext';

type UseSignUpReturn =
  | { isLoaded: false; signUp: undefined; setSession: undefined; setActive: undefined }
  | { isLoaded: true; signUp: SignUpResource; setSession: SetSession; setActive: SetActive };

type CreateSignUp = () => Accessor<UseSignUpReturn>;

export const createSignUp: CreateSignUp = () => {
  const isomorphicClerk = useIsomorphicClerkContext();
  const client = useClientContext();
  return () => {
    const c = client();
    if (!c) {
      return { isLoaded: false, signUp: undefined, setSession: undefined, setActive: undefined };
    }
    return {
      isLoaded: true,
      signUp: c.signUp,
      setSession: isomorphicClerk().setSession,
      setActive: isomorphicClerk().setActive,
    };
  };
};
