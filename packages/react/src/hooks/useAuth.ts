import { createCheckAuthorization, resolveAuthState } from '@clerk/shared/authorization';
import { eventMethodCalled } from '@clerk/shared/telemetry';
import type {
  CheckAuthorizationWithCustomPermissions,
  GetToken,
  JwtPayload,
  PendingSessionOptions,
  SignOut,
  UseAuthReturn,
} from '@clerk/shared/types';
import { useCallback } from 'react';
import { useAuthState } from 'src/contexts/AuthContext';

import { useIsomorphicClerkContext } from '../contexts/IsomorphicClerkContext';
import { errorThrower } from '../errors/errorThrower';
import { invalidStateError } from '../errors/messages';
import { useAssertWrappedByClerkProvider } from './useAssertWrappedByClerkProvider';
import { createGetToken, createSignOut } from './utils';

/**
 * @inline
 */
type UseAuthOptions = PendingSessionOptions | undefined | null;

/**
 * The `useAuth()` hook provides access to the current user's authentication state and methods to manage the active session.
 *
 * > [!NOTE]
 * > To access auth data server-side, see the [`Auth` object reference doc](https://clerk.com/docs/reference/backend/types/auth-object).
 *
 * <If sdk="nextjs">
 * By default, Next.js opts all routes into static rendering. If you need to opt a route or routes into dynamic rendering because you need to access the authentication data at request time, you can create a boundary by passing the `dynamic` prop to `<ClerkProvider>`. See the [guide on rendering modes](https://clerk.com/docs/guides/development/rendering-modes) for more information, including code examples.
 * </If>
 *
 * @unionReturnHeadings
 * ["Initialization", "Signed out", "Signed in (no active organization)", "Signed in (with active organization)"]
 *
 * @param [options] - An object containing options for the `useAuth()` hook. `treatPendingAsSignedOut` is a boolean that indicates whether pending sessions are considered as signed out or not. Defaults to `true`.
 *
 * @function
 *
 * @example
 *
 * The following example demonstrates how to use the `useAuth()` hook to access the current auth state, like whether the user is signed in or not. It also includes a basic example for using the `getToken()` method to retrieve a session token for fetching data from an external resource.
 *
 * <Tabs items='React,Next.js'>
 * <Tab>
 *
 * ```tsx {{ filename: 'src/pages/ExternalDataPage.tsx' }}
 * import { useAuth } from '@clerk/react'
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
 *
 * </Tab>
 * <Tab>
 *
 * {@include ../../docs/use-auth.md#nextjs-01}
 *
 * </Tab>
 * </Tabs>
 */
export const useAuth = (options: UseAuthOptions = {}): UseAuthReturn => {
  useAssertWrappedByClerkProvider('useAuth');

  const { treatPendingAsSignedOut } = options ?? {};
  const authState = useAuthState();

  const isomorphicClerk = useIsomorphicClerkContext();
  const getToken: GetToken = useCallback(createGetToken(isomorphicClerk), [isomorphicClerk]);
  const signOut: SignOut = useCallback(createSignOut(isomorphicClerk), [isomorphicClerk]);

  isomorphicClerk.telemetry?.record(eventMethodCalled('useAuth', { treatPendingAsSignedOut }));

  return useDerivedAuth(
    {
      ...authState,
      getToken,
      signOut,
    },
    {
      treatPendingAsSignedOut,
    },
  );
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
export function useDerivedAuth(
  authObject: any,
  { treatPendingAsSignedOut = true }: PendingSessionOptions = {},
): UseAuthReturn {
  const { userId, orgId, orgRole, has, signOut, getToken, orgPermissions, factorVerificationAge, sessionClaims } =
    authObject ?? {};

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
        features: ((sessionClaims as JwtPayload | undefined)?.fea as string) || '',
        plans: ((sessionClaims as JwtPayload | undefined)?.pla as string) || '',
      })(params);
    },
    [has, userId, orgId, orgRole, orgPermissions, factorVerificationAge, sessionClaims],
  );

  const payload = resolveAuthState({
    authObject: {
      ...authObject,
      getToken,
      signOut,
      has: derivedHas,
    },
    options: {
      treatPendingAsSignedOut,
    },
  });

  if (!payload) {
    return errorThrower.throw(invalidStateError);
  }

  return payload;
}
