import { createCheckAuthorization } from '@clerk/shared/authorization';
import type { CheckAuthorizationWithCustomPermissions, GetToken, SignOut, UseAuthReturn } from '@clerk/types';
import { useCallback, useEffect, useState } from 'react';

import { useAuthContext } from '../contexts/AuthContext';
import { useIsomorphicClerkContext } from '../contexts/IsomorphicClerkContext';
import { errorThrower } from '../errors/errorThrower';
import { invalidStateError } from '../errors/messages';
import { useAssertWrappedByClerkProvider } from './useAssertWrappedByClerkProvider';
import { createGetToken, createSignOut } from './utils';

type UseAuth = (initialAuthState?: any) => UseAuthReturn;

/**
 * Returns the current auth state, the user and session ids and the `getToken`
 * that can be used to retrieve the given template or the default Clerk token.
 *
 * Until Clerk loads, `isLoaded` will be set to `false`.
 * Once Clerk loads, `isLoaded` will be set to `true`, and you can
 * safely access the `userId` and `sessionId` variables.
 *
 * For projects using NextJs or Remix, you can have immediate access to this data during SSR
 * simply by using the `ClerkProvider`.
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
 *
 * export HelloPage = () => {
 *   const { isSignedIn, sessionId, userId } = useAuth();
 *   console.log(isSignedIn, sessionId, userId)
 *   return <div>...</div>
 * }
 */
export const useAuth: UseAuth = (initialAuthState = {}) => {
  useAssertWrappedByClerkProvider('useAuth');

  const authContext = useAuthContext();

  const [authState, setAuthState] = useState(() => {
    // This indicates the authContext is not available, and so we fallback to the provided initialState
    if (authContext.sessionId === undefined && authContext.userId === undefined) {
      return initialAuthState ?? {};
    }
    return authContext;
  });

  useEffect(() => {
    if (authContext.sessionId === undefined && authContext.userId === undefined) {
      return;
    }
    setAuthState(authContext);
  }, [authContext]);

  const { sessionId, userId, actor, orgId, orgRole, orgSlug, orgPermissions, factorVerificationAge } = authState;
  const isomorphicClerk = useIsomorphicClerkContext();

  const getToken: GetToken = useCallback(createGetToken(isomorphicClerk), [isomorphicClerk]);
  const signOut: SignOut = useCallback(createSignOut(isomorphicClerk), [isomorphicClerk]);

  return useDerivedAuth({
    sessionId,
    userId,
    actor,
    orgId,
    orgSlug,
    orgRole,
    getToken,
    signOut,
    orgPermissions,
    factorVerificationAge,
  });
};

export function useDerivedAuth(authObject: any): UseAuthReturn {
  const {
    sessionId,
    userId,
    actor,
    orgId,
    orgSlug,
    orgRole,
    has,
    signOut,
    getToken,
    orgPermissions,
    factorVerificationAge,
  } = authObject ?? {};

  const derivedHas = useCallback(
    (params: Parameters<CheckAuthorizationWithCustomPermissions>[0]) => {
      if (has) {
        return has(params);
      }
      return createCheckAuthorization({
        userId,
        orgId,
        orgRole,
        orgPermissions,
        factorVerificationAge,
      })(params);
    },
    [userId, factorVerificationAge, orgId, orgRole, orgPermissions],
  );

  if (sessionId === undefined && userId === undefined) {
    return {
      isLoaded: false,
      isSignedIn: undefined,
      sessionId,
      userId,
      actor: undefined,
      orgId: undefined,
      orgRole: undefined,
      orgSlug: undefined,
      has: undefined,
      signOut,
      getToken,
    };
  }

  if (sessionId === null && userId === null) {
    return {
      isLoaded: true,
      isSignedIn: false,
      sessionId,
      userId,
      actor: null,
      orgId: null,
      orgRole: null,
      orgSlug: null,
      has: () => false,
      signOut,
      getToken,
    };
  }

  if (!!sessionId && !!userId && !!orgId && !!orgRole) {
    return {
      isLoaded: true,
      isSignedIn: true,
      sessionId,
      userId,
      actor: actor || null,
      orgId,
      orgRole,
      orgSlug: orgSlug || null,
      has: derivedHas,
      signOut,
      getToken,
    };
  }

  if (!!sessionId && !!userId && !orgId) {
    return {
      isLoaded: true,
      isSignedIn: true,
      sessionId,
      userId,
      actor: actor || null,
      orgId: null,
      orgRole: null,
      orgSlug: null,
      has: derivedHas,
      signOut,
      getToken,
    };
  }

  return errorThrower.throw(invalidStateError);
}
