import type { ActiveSessionResource } from '@clerk/types';

import { useSessionContext } from '../contexts/SessionContext';

type UseSessionReturn =
  | { isLoaded: false; isSignedIn: undefined; session: undefined }
  | { isLoaded: true; isSignedIn: false; session: null }
  | { isLoaded: true; isSignedIn: true; session: ActiveSessionResource };

type UseSession = () => UseSessionReturn;

/**
 * Returns the current auth state and if a session exists, the session object.
 *
 * Until Clerk loads and initializes, `isLoaded` will be set to `false`.
 * Once Clerk loads, `isLoaded` will be set to `true`, and you can
 * safely access `isSignedIn` state and `session`.
 *
 * @example
 * A simple example:
 *
 * import { useSession } from '@clerk/clerk-react'
 *
 * function Hello() {
 *   const { isSignedIn, session } = useSession();
 *   if(!isSignedIn) {
 *     return null;
 *   }
 *   return <div>{session.updatedAt}</div>
 * }
 */
export const useSession: UseSession = () => {
  const session = useSessionContext();

  if (session === undefined) {
    return { isLoaded: false, isSignedIn: undefined, session: undefined };
  }

  if (session === null) {
    return { isLoaded: true, isSignedIn: false, session: null };
  }

  return { isLoaded: true, isSignedIn: true, session };
};
