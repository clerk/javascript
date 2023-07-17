import type { SetActive, SetSession, SignInResource } from '@clerk/types';

import { useClientContext } from '../contexts/ClientContext';
import { useIsomorphicClerkContext } from '../contexts/IsomorphicClerkContext';

type UseSignInReturn =
  | {
      isLoaded: false;
      signIn: undefined;
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
      signIn: SignInResource;
      /**
       * @deprecated This method is deprecated and will be removed in the future. Use {@link Clerk.setActive} instead
       * Set the current session explicitly. Setting the session to `null` unsets the active session and signs out the user.
       * @param session Passed session resource object, session id (string version) or null
       * @param beforeEmit Callback run just before the active session is set to the passed object. Can be used to hook up for pre-navigation actions.
       */
      setSession: SetSession;
      setActive: SetActive;
    };

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
