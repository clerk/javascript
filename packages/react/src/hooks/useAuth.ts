import { createCheckAuthorization, resolveAuthState } from '@clerk/shared/authorization';
import { eventMethodCalled } from '@clerk/shared/telemetry';
import type {
  CheckAuthorizationWithCustomPermissions,
  GetToken,
  JwtPayload,
  PendingSessionOptions,
  Resources,
  SignOut,
  UseAuthReturn,
} from '@clerk/shared/types';
import { useCallback } from 'react';

import { useAuthContext } from '../contexts/AuthContext';
import { useIsomorphicClerkContext } from '../contexts/IsomorphicClerkContext';
import { errorThrower } from '../errors/errorThrower';
import { invalidStateError } from '../errors/messages';
import type { IsomorphicClerk } from '../isomorphicClerk';
import { useAssertWrappedByClerkProvider } from './useAssertWrappedByClerkProvider';
import { createGetToken, createSignOut } from './utils';

const clerkLoadedSuspenseCache = new WeakMap<IsomorphicClerk, Promise<void>>();
const transitiveStateSuspenseCache = new WeakMap<IsomorphicClerk, Promise<void>>();

function createClerkLoadedSuspensePromise(clerk: IsomorphicClerk): Promise<void> {
  if (clerk.loaded) {
    return Promise.resolve();
  }

  const existingPromise = clerkLoadedSuspenseCache.get(clerk);
  if (existingPromise) {
    return existingPromise;
  }

  const promise = new Promise<void>(resolve => {
    if (clerk.loaded) {
      resolve();
      return;
    }

    const unsubscribe = clerk.addListener((payload: Resources) => {
      if (
        payload.client ||
        payload.session !== undefined ||
        payload.user !== undefined ||
        payload.organization !== undefined
      ) {
        if (clerk.loaded) {
          clerkLoadedSuspenseCache.delete(clerk);
          unsubscribe();
          resolve();
        }
      }
    });
  });

  clerkLoadedSuspenseCache.set(clerk, promise);
  return promise;
}

function createTransitiveStateSuspensePromise(
  clerk: IsomorphicClerk,
  authContext: { sessionId?: string | null; userId?: string | null },
): Promise<void> {
  if (authContext.sessionId !== undefined || authContext.userId !== undefined) {
    return Promise.resolve();
  }

  const existingPromise = transitiveStateSuspenseCache.get(clerk);
  if (existingPromise) {
    return existingPromise;
  }

  const promise = new Promise<void>(resolve => {
    if (authContext.sessionId !== undefined || authContext.userId !== undefined) {
      resolve();
      return;
    }

    const unsubscribe = clerk.addListener((payload: Resources) => {
      if (payload.session !== undefined || payload.user !== undefined) {
        transitiveStateSuspenseCache.delete(clerk);
        unsubscribe();
        resolve();
      }
    });
  });

  transitiveStateSuspenseCache.set(clerk, promise);
  return promise;
}

/**
 * @inline
 */
type UseAuthOptions = Record<string, any> | PendingSessionOptions | undefined | null;

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
 * @param [initialAuthStateOrOptions] - An object containing the initial authentication state or options for the `useAuth()` hook. If not provided, the hook will attempt to derive the state from the context. `treatPendingAsSignedOut` is a boolean that indicates whether pending sessions are considered as signed out or not. Defaults to `true`. `suspense` is a boolean that enables React Suspense behavior - when `true`, the hook will suspend instead of returning `isLoaded: false`. Requires a Suspense boundary. Defaults to `false`.
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
 *
 * </Tab>
 * <Tab>
 *
 * {@include ../../docs/use-auth.md#nextjs-01}
 *
 * </Tab>
 * </Tabs>
 */
export const useAuth = (initialAuthStateOrOptions: UseAuthOptions = {}): UseAuthReturn => {
  useAssertWrappedByClerkProvider('useAuth');

  const options = initialAuthStateOrOptions ?? {};
  const suspense = Boolean((options as any).suspense);
  const treatPendingAsSignedOut =
    'treatPendingAsSignedOut' in options ? (options.treatPendingAsSignedOut as boolean | undefined) : undefined;

  const { suspense: _s, treatPendingAsSignedOut: _t, ...rest } = options as Record<string, any>;
  const initialAuthState = rest as any;

  const authContextFromHook = useAuthContext();
  const isomorphicClerk = useIsomorphicClerkContext();
  let authContext = authContextFromHook;

  if (suspense) {
    if (!isomorphicClerk.loaded) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error -- React Suspense requires throwing a promise
      throw createClerkLoadedSuspensePromise(isomorphicClerk);
    }

    if (authContext.sessionId === undefined && authContext.userId === undefined) {
      // eslint-disable-next-line @typescript-eslint/only-throw-error -- React Suspense requires throwing a promise
      throw createTransitiveStateSuspensePromise(isomorphicClerk, authContext);
    }
  }

  if (!isomorphicClerk.loaded && authContext.sessionId === undefined && authContext.userId === undefined) {
    authContext = initialAuthState != null ? initialAuthState : {};
  }

  const getToken: GetToken = useCallback(opts => createGetToken(isomorphicClerk)(opts), [isomorphicClerk]);
  const signOut: SignOut = useCallback(opts => createSignOut(isomorphicClerk)(opts), [isomorphicClerk]);

  isomorphicClerk.telemetry?.record(eventMethodCalled('useAuth', { suspense, treatPendingAsSignedOut }));

  return useDerivedAuth(
    {
      ...authContext,
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
    [has, userId, orgId, orgRole, orgPermissions, factorVerificationAge],
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
