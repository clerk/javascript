import type { SetActive, SetSession, SignUpResource } from '@clerk/types';

import { useClientContext } from '../contexts/ClientContext';
import { useIsomorphicClerkContext } from '../contexts/IsomorphicClerkContext';

type UseSignUpReturn =
  | {
      isLoaded: false;
      signUp: undefined;
      /**
       * @deprecated This method is deprecated and will be removed in the future. Use {@link Clerk.setActive} instead
       * Set the current session explicitly. Setting the session to `null` unsets the active session and signs out the user.
       * @param session Passed session resource object, session id (string version) or null
       * @param beforeEmit Callback run just before the active session is set to the passed object. Can be used to hook up for pre-navigation actions.
       */
      setSession: undefined;
      setActive: undefined;
    }
  | {
      isLoaded: true;
      signUp: SignUpResource;
      /**
       * @deprecated This method is deprecated and will be removed in the future. Use {@link Clerk.setActive} instead
       * Set the current session explicitly. Setting the session to `null` unsets the active session and signs out the user.
       * @param session Passed session resource object, session id (string version) or null
       * @param beforeEmit Callback run just before the active session is set to the passed object. Can be used to hook up for pre-navigation actions.
       */
      setSession: SetSession;
      setActive: SetActive;
    };

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
