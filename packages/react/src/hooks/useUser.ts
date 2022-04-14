import { UserResource } from '@clerk/types';

import { useUserContext } from '../contexts/UserContext';

type UseUserReturn =
  | { isLoaded: false; isSignedIn: undefined; user: undefined }
  | { isLoaded: true; isSignedIn: false; user: null }
  | { isLoaded: true; isSignedIn: true; user: UserResource };

/**
 * Returns the current auth state and if a user is signed in, the user object.
 *
 * Until Clerk loads and initializes, `isLoaded` will be set to `false`.
 * Once Clerk loads, `isLoaded` will be set to `true`, and you can
 * safely access `isSignedIn` state and `user`.
 *
 * For projects using NextJs or Remix, you can make this state available during SSR
 * simply by using the `withServerSideAuth` helper and setting the `loadUser` flag to `true`.
 *
 * If you want to disable strict type checking, pass the generic `guaranteed` type flag
 * as shown in the last example below.
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
 *
 * @example
 * Basic example in a NextJs app. This page will be fully rendered during SSR:
 *
 * import { useUser } from '@clerk/nextjs'
 * import { withServerSideAuth } from '@clerk/nextjs/api'
 *
 * export getServerSideProps = withServerSideAuth({ loadUser: true});
 *
 * export HelloPage = () => {
 *   const { isSignedIn, user } = useUser();
 *   if(!isSignedIn) {
 *     return null;
 *   }
 *   return <div>Hello, {user.firstName}</div>
 * }
 *
 * @example
 * Disable strict type checking:
 *
 * function Hello() {
 *   const { user } = useUser<guaranteed>();
 *   return <div>Hello, {user.firstName}</div>
 * }
 */
export function useUser(): UseUserReturn {
  const user = useUserContext();

  if (user === undefined) {
    return { isLoaded: false, isSignedIn: undefined, user: undefined };
  }

  if (user === null) {
    return { isLoaded: true, isSignedIn: false, user: null };
  }

  return { isLoaded: true, isSignedIn: true, user };
}
