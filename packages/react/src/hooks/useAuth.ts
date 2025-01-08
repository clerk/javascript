import { createCheckAuthorization } from '@clerk/shared/authorization';
import type { CheckAuthorizationWithCustomPermissions, GetToken, SignOut, UseAuthReturn } from '@clerk/types';
import { useCallback } from 'react';

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
 */
export const useAuth: UseAuth = (initialAuthState = {}) => {
  useAssertWrappedByClerkProvider('useAuth');

  const authContextFromHook = useAuthContext();
  let authContext = authContextFromHook;

  if (authContext.sessionId === undefined && authContext.userId === undefined) {
    authContext = initialAuthState != null ? initialAuthState : {};
  }

  const { sessionId, userId, actor, orgId, orgRole, orgSlug, orgPermissions, factorVerificationAge } = authContext;
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

/**
 * A hook that derives and returns authentication state and utility functions based on the provided auth object.
 *
 * @param authObject - An object containing authentication-related properties and functions.
 *
 * @returns A derived authentication state with helper methods. If the authentication state is invalid, an error is thrown.
 *
 * @remarks
 * This hook inspects session, user, and organization information to determine the current authentication state.
 * It returns an object that includes various properties such as whether the state is loaded, if a user is signed in,
 * session and user identifiers, organization roles, and a `has` function for authorization checks.
 * Additionally, it provides `signOut` and `getToken` functions if applicable.
 *
 * Example usage:
 * ```tsx
 * const {
 *   isLoaded,
 *   isSignedIn,
 *   userId,
 *   orgId,
 *   has,
 *   signOut,
 *   getToken
 * } = useDerivedAuth(authObject);
 * ```
 */
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
