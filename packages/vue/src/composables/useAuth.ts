import { createCheckAuthorization, resolveAuthState } from '@clerk/shared/authorization';
import type { Clerk, GetToken, JwtPayload, PendingSessionOptions, SignOut, UseAuthReturn } from '@clerk/shared/types';
import { computed, type ShallowRef, watch } from 'vue';

import { errorThrower } from '../errors/errorThrower';
import { invalidStateError } from '../errors/messages';
import type { ToComputedRefs } from '../utils';
import { toComputedRefs } from '../utils';
import { useClerkContext } from './useClerkContext';

/**
 * @internal
 */
function clerkLoaded(clerk: ShallowRef<Clerk | null>) {
  return new Promise<Clerk>(resolve => {
    let unwatch: (() => void) | undefined;
    // eslint-disable-next-line prefer-const
    unwatch = watch(
      clerk,
      value => {
        if (value?.loaded) {
          resolve(value);
          unwatch?.();
        }
      },
      { immediate: true },
    );
  });
}

/**
 * @internal
 */
function createGetToken(clerk: ShallowRef<Clerk | null>) {
  return async (options: any) => {
    const loadedClerk = await clerkLoaded(clerk);
    if (!loadedClerk.session) {
      return null;
    }

    return loadedClerk.session.getToken(options);
  };
}

/**
 * @internal
 */
function createSignOut(clerk: ShallowRef<Clerk | null>) {
  return async (...args: any) => {
    const loadedClerk = await clerkLoaded(clerk);
    return loadedClerk.signOut(...args);
  };
}

type UseAuth = (options?: PendingSessionOptions) => ToComputedRefs<UseAuthReturn>;

/**
 * Returns the current auth state, the user and session ids and the `getToken`
 * that can be used to retrieve the given template or the default Clerk token.
 *
 * Until Clerk loads, `isLoaded` will be set to `false`.
 * Once Clerk loads, `isLoaded` will be set to `true`, and you can
 * safely access the `userId` and `sessionId` variables.
 *
 * @example
 * <script setup>
 * import { useAuth } from '@clerk/vue'
 *
 * const { isSignedIn, sessionId, userId } = useAuth()
 * </script>
 *
 * <template>
 *   <div v-if="isSignedIn">
 *     <!-- {{ sessionId }} {{ userId }} -->
 *     ...
 *   </div>
 * </template>
 */
export const useAuth: UseAuth = (options = {}) => {
  const { clerk, authCtx } = useClerkContext('useAuth');

  const getToken: GetToken = createGetToken(clerk);
  const signOut: SignOut = createSignOut(clerk);

  const result = computed<UseAuthReturn>(() => {
    const { userId, orgId, orgRole, orgPermissions, sessionClaims, factorVerificationAge } = authCtx.value;

    const has = createCheckAuthorization({
      userId,
      orgId,
      orgRole,
      orgPermissions,
      factorVerificationAge,
      features: ((sessionClaims as JwtPayload | undefined)?.fea as string) || '',
      plans: ((sessionClaims as JwtPayload | undefined)?.pla as string) || '',
    });

    const payload = resolveAuthState({
      authObject: {
        ...authCtx.value,
        getToken,
        signOut,
        has,
      },
      options: {
        treatPendingAsSignedOut: options.treatPendingAsSignedOut,
      },
    });

    if (!payload) {
      return errorThrower.throw(invalidStateError);
    }

    return payload;
  });

  return toComputedRefs(result);
};
