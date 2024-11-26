import type { UseUserReturn } from '@clerk/types';

import { useAssertWrappedByClerkProvider, useUserContext } from '../contexts';

/**
 * Returns the current auth state and if a user is signed in, the user object.
 *
 * Until Clerk loads and initializes, `isLoaded` will be set to `false`.
 * Once Clerk loads, `isLoaded` will be set to `true`, and you can
 * safely access `isSignedIn` state and `user`.
 *
 * @example
 * A simple example:
 *
 * import { useUser } from '@clerk/clerk-react'
 *
 * function Hello() {
 *   const { isSignedIn, user } = useUser();
 *   if(!isSignedIn) {
 *     return null;
 *   }
 *   return <div>Hello, {user.firstName}</div>
 * }
 */
export function useUser(): UseUserReturn {
  useAssertWrappedByClerkProvider('useUser');

  const user = useUserContext();

  if (user === undefined) {
    return { isLoaded: false, isSignedIn: undefined, user: undefined };
  }

  if (user === null) {
    return { isLoaded: true, isSignedIn: false, user: null };
  }

  return { isLoaded: true, isSignedIn: true, user };
}
