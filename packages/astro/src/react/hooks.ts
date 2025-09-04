import { createCheckAuthorization, resolveAuthState } from '@clerk/shared/authorization';
import { deriveState } from '@clerk/shared/deriveState';
import type {
  CheckAuthorizationWithCustomPermissions,
  Clerk,
  ClientResource,
  GetToken,
  JwtPayload,
  PendingSessionOptions,
  SignOut,
  UseAuthReturn,
} from '@clerk/types';
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
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
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

type UseAuth = (options?: PendingSessionOptions) => UseAuthReturn;

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
export const useAuth: UseAuth = ({ treatPendingAsSignedOut } = {}) => {
  const authContext = useAuthStore();

  const getToken: GetToken = useCallback(createGetToken(), []);
  const signOut: SignOut = useCallback(createSignOut(), []);

  const { userId, orgId, orgRole, orgPermissions, factorVerificationAge, sessionClaims } = authContext;

  const has = useCallback(
    (params: Parameters<CheckAuthorizationWithCustomPermissions>[0]) => {
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
    [userId, orgId, orgRole, orgPermissions, factorVerificationAge, sessionClaims],
  );

  const payload = resolveAuthState({
    authObject: {
      ...authContext,
      getToken,
      signOut,
      has,
    },
    options: {
      treatPendingAsSignedOut,
    },
  });

  if (!payload) {
    throw new Error('Invalid state. Feel free to submit a bug or reach out to support');
  }

  return payload;
};

function useStore<T extends Store, SV extends StoreValue<T>>(store: T, getServerSnapshot?: () => SV): SV {
  const get = store.get.bind(store);
  return useSyncExternalStore<SV>(store.listen, get, getServerSnapshot || get);
}

/**
 * This implementation of `useStore` is an alternative solution to the hook exported by nanostores
 * Reference: https://github.com/nanostores/react/blob/main/index.js
 */
function useAuthStore() {
  const get = $authStore.get.bind($authStore);
  return useStore($authStore, () => {
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
      return deriveState(
        false,
        {
          user: null,
          session: null,
          client: null as unknown as ClientResource,
          organization: null,
        },
        authAsyncStorage.getStore() as any,
      );
    }

    /**
     * When this runs on the client, during hydration, we want to grab the content the store.
     */
    return get();
  });
}
