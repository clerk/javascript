import type { Clerk, GetToken, SignOut, UseAuthReturn } from '@clerk/types';
import type { Store, StoreValue } from 'nanostores';
import { useCallback, useSyncExternalStore } from 'react';

import { authAsyncStorage } from '#async-local-storage';

import { $authStore } from '../stores/external';
import { $clerk, $csrState } from '../stores/internal';

/**
 * @internal
 */
const clerkLoaded = () => {
  return new Promise<Clerk>(resolve => {
    $csrState.subscribe(({ isLoaded }) => {
      if (isLoaded) {
        resolve($clerk.get()!);
      }
    });
  });
};

/**
 * @internal
 */
const createGetToken = () => {
  return async (options: any) => {
    const clerk = await clerkLoaded();
    if (!clerk.session) {
      return null;
    }
    return clerk.session.getToken(options);
  };
};

/**
 * @internal
 */
const createSignOut = () => {
  return async (...args: any) => {
    const clerk = await clerkLoaded();
    return clerk.signOut(...args);
  };
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
 * For projects using a server, you can have immediate access to this data during SSR.
 *
 * @example
 * function Hello() {
 *   const { isSignedIn, sessionId, userId } = useAuth();
 *   if(isSignedIn) {
 *     return null;
 *   }
 *   console.log(sessionId, userId)
 *   return <div>...</div>
 * }
 *
 * This page will be fully rendered during SSR:
 * @example
 * export HelloPage = () => {
 *   const { isSignedIn, sessionId, userId } = useAuth();
 *   console.log(isSignedIn, sessionId, userId)
 *   return <div>...</div>
 * }
 */
export const useAuth: UseAuth = () => {
  const { sessionId, userId, actor, orgId, orgRole, orgSlug, orgPermissions } = useStore($authStore);

  const getToken: GetToken = useCallback(createGetToken(), []);
  const signOut: SignOut = useCallback(createSignOut(), []);

  const has = useCallback<NonNullable<UseAuthReturn['has']>>(
    params => {
      if (!params?.permission && !params?.role) {
        throw new Error(
          'Missing parameters. `has` from `useAuth` requires a permission or role key to be passed. Example usage: `has({permission: "org:posts:edit"`',
        );
      }

      if (!orgId || !userId || !orgRole || !orgPermissions) {
        return false;
      }

      if (params.permission) {
        return orgPermissions.includes(params.permission);
      }

      if (params.role) {
        return orgRole === params.role;
      }

      return false;
    },
    [orgId, orgRole, userId, orgPermissions],
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
      has,
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
      has: () => false,
      signOut,
      getToken,
    };
  }

  throw new Error('Invalid state. Feel free to submit a bug or reach out to support');
};

/**
 * This implementation of `useStore` is an alternative solution to the hook exported by nanostores
 * Reference: https://github.com/nanostores/react/blob/main/index.js
 */
function useStore<T extends Store, SV extends StoreValue<T>>(store: T): SV {
  const get = store.get.bind(store);

  return useSyncExternalStore<SV>(store.listen, get, () => {
    // Per react docs
    /**
     * optional getServerSnapshot:
     * A function that returns the initial snapshot of the data in the store.
     * It will be used only during server rendering and during hydration of server-rendered content on the client.
     * The server snapshot must be the same between the client and the server, and is usually serialized and passed from the server to the client.
     * If you omit this argument, rendering the component on the server will throw an error.
     */

    /**
     * When this runs on the server we want to grab the content from the async-local-storage.
     */
    if (typeof window === 'undefined') {
      return authAsyncStorage.getStore();
    }

    /**
     * When this runs on the client, during hydration, we want to grab the content the store.
     */
    return get();
  });
}
