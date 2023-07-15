import type { SessionResource, SetActive, SetSession } from '@clerk/types';

import { useClientContext } from '../contexts/ClientContext';
import { useIsomorphicClerkContext } from '../contexts/IsomorphicClerkContext';

type UseSessionListReturn =
  | {
      isLoaded: false;
      sessions: undefined;
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
      sessions: SessionResource[];

      /**
       * @deprecated This method is deprecated and will be removed in the future. Use {@link Clerk.setActive} instead
       * Set the current session explicitly. Setting the session to `null` unsets the active session and signs out the user.
       * @param session Passed session resource object, session id (string version) or null
       * @param beforeEmit Callback run just before the active session is set to the passed object. Can be used to hook up for pre-navigation actions.
       */
      setSession: SetSession;
      setActive: SetActive;
    };

type UseSessionList = () => UseSessionListReturn;

export const useSessionList: UseSessionList = () => {
  const isomorphicClerk = useIsomorphicClerkContext();
  const client = useClientContext();

  if (!client) {
    return { isLoaded: false, sessions: undefined, setSession: undefined, setActive: undefined };
  }

  return {
    isLoaded: true,
    sessions: client.sessions,
    setSession: isomorphicClerk.setSession,
    setActive: isomorphicClerk.setActive,
  };
};
