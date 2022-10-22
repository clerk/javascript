import type { ActJWTClaim, GetToken, SignOut } from '@clerk/types';
import { useMemo } from 'react';

import { useAuthContext } from '../contexts/AuthContext';
import { useIsomorphicClerkContext } from '../contexts/IsomorphicClerkContext';
import { invalidStateError } from '../errors';
import { createGetToken, createSignOut } from './utils';

type UseAuthReturn = {
  isLoaded: boolean;
  isSignedIn: boolean | undefined;
  userId: string | null | undefined;
  sessionId: string | null | undefined;
  actor: ActJWTClaim | null;
  signOut: SignOut;
  getToken: GetToken;
};

type UseAuth = () => UseAuthReturn;

/**
 * Returns the current auth state, the user and session ids and the `getToken`
 * that can be used to retrieve the given template or the default Clerk token.
 *
 * Until Clerk loads, `isLoaded` will be set to `false`.
 * Once Clerk loads, `isLoaded` will be set to `true`, and you can
 * safely access the `userId` and `sessionId` variables.
 *
 * For projects using NextJs or Remix, you can have immediate access to this data  during SSR
 * simply by using the `withServerSideAuth` helper.
 *
 * @example
 * A simple example:
 *
 * import { useAuth } from '@clerk/clerk-react'
 *
 * function Hello() {
 *   const { isSignedIn, sessionId, userId } = useAuth();
 *   if(isSignedIn) {
 *     return null;
 *   }
 *   console.log(sessionId, userId)
 *   return <div>...</div>
 * }
 *
 * @example
 * Basic example in a NextJs app. This page will be fully rendered during SSR:
 *
 * import { useAuth } from '@clerk/nextjs'
 * import { withServerSideAuth } from '@clerk/nextjs/api'
 *
 * export getServerSideProps = withServerSideAuth();
 *
 * export HelloPage = () => {
 *   const { isSignedIn, sessionId, userId } = useAuth();
 *   console.log(isSignedIn, sessionId, userId)
 *   return <div>...</div>
 * }
 */
export const useAuth: UseAuth = () => {
  const { sessionId, userId, actor } = useAuthContext();
  const isomorphicClerk = useIsomorphicClerkContext();

  const getToken: GetToken = useMemo(() => {
    return createGetToken(isomorphicClerk);
  }, [isomorphicClerk]);
  const signOut: SignOut = useMemo(() => {
    return createSignOut(isomorphicClerk);
  }, [isomorphicClerk]);

  // Make this stable as well!
  const auth: UseAuthReturn = {
    // These come from somewhere else; considered stable here
    sessionId,
    userId,
    signOut,
    getToken,

    // These 3 vary depending on the conditions
    isLoaded: false,
    isSignedIn: false,
    actor: null,
  };

  let isValidState = false;
  if (sessionId === undefined && userId === undefined) {
    isValidState = true;
    auth.isLoaded = false;
    auth.isSignedIn = undefined;
    auth.actor = null;
  }

  if (sessionId === null && userId === null) {
    isValidState = true;
    auth.isLoaded = true;
    auth.isSignedIn = undefined;
    auth.actor = actor;
  }

  if (!!sessionId && !!userId) {
    isValidState = true;
    auth.isLoaded = true;
    auth.isSignedIn = true;
    auth.actor = actor;
  }

  // When any of the values of auth changes, create a new auth; but if
  // none of them change, keep auth also stable!
  const StableAuth = useMemo(() => auth, Object.values(auth));

  if (!isValidState) {
    throw new Error(invalidStateError);
  }

  return StableAuth;
};
