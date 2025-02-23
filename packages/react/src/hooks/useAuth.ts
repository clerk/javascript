import { createCheckAuthorization } from '@clerk/shared/authorization';
import type { CheckAuthorizationWithCustomPermissions, GetToken, SignOut, UseAuthReturn } from '@clerk/types';
import { useCallback } from 'react';

import { useAuthContext } from '../contexts/AuthContext';
import { useIsomorphicClerkContext } from '../contexts/IsomorphicClerkContext';
import { errorThrower } from '../errors/errorThrower';
import { invalidStateError } from '../errors/messages';
import { useAssertWrappedByClerkProvider } from './useAssertWrappedByClerkProvider';
import { createGetToken, createSignOut } from './utils';

/**
 * The `useAuth()` hook provides access to the current user's authentication state and methods to manage the active session.
 *
 * @example
 *
 * The following example demonstrates how to use the `useAuth()` hook to access the current auth state, like whether the user is signed in or not. It also includes a basic example for using the `getToken()` method to retrieve a session token for fetching data from an external resource.
 *
 * ```tsx {{ filename: 'src/pages/ExternalDataPage.tsx' }}
 * import { useAuth } from '@clerk/clerk-react'
 *
 * export default function ExternalDataPage() {
 *   const { userId, sessionId, getToken, isLoaded, isSignedIn } = useAuth()
 *
 *   const fetchExternalData = async () => {
 *     const token = await getToken()
 *
 *     // Fetch data from an external API
 *     const response = await fetch('https://api.example.com/data', {
 *       headers: {
 *         Authorization: `Bearer ${token}`,
 *       },
 *     })
 *
 *     return response.json()
 *   }
 *
 *   if (!isLoaded) {
 *     return <div>Loading...</div>
 *   }
 *
 *   if (!isSignedIn) {
 *     return <div>Sign in to view this page</div>
 *   }
 *
 *   return (
 *     <div>
 *       <p>
 *         Hello, {userId}! Your current active session is {sessionId}.
 *       </p>
 *       <button onClick={fetchExternalData}>Fetch Data</button>
 *     </div>
 *   )
 * }
 * ```
 */
export const useAuth = (initialAuthState: any = {}): UseAuthReturn => {
  useAssertWrappedByClerkProvider('useAuth');

  const authContextFromHook = useAuthContext();
  let authContext = authContextFromHook;

  if (authContext.sessionId === undefined && authContext.userId === undefined) {
    authContext = initialAuthState != null ? initialAuthState : {};
  }

  const { sessionId, sessionClaims, userId, actor, orgId, orgRole, orgSlug, orgPermissions, factorVerificationAge } =
    authContext;
  const isomorphicClerk = useIsomorphicClerkContext();

  const getToken: GetToken = useCallback(createGetToken(isomorphicClerk), [isomorphicClerk]);
  const signOut: SignOut = useCallback(createSignOut(isomorphicClerk), [isomorphicClerk]);

  return useDerivedAuth({
    sessionId,
    sessionClaims,
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
 * @example
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
    sessionClaims,
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
      sessionClaims: undefined,
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
      sessionClaims: null,
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

  if (!!sessionId && !!sessionClaims && !!userId && !!orgId && !!orgRole) {
    return {
      isLoaded: true,
      isSignedIn: true,
      sessionId,
      sessionClaims,
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

  if (!!sessionId && !!sessionClaims && !!userId && !orgId) {
    return {
      isLoaded: true,
      isSignedIn: true,
      sessionId,
      sessionClaims,
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
