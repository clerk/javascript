import type {
  CheckAuthorizationWithCustomPermissions,
  HandleOAuthCallbackParams as HandleOAuthCallbackParamsOriginal,
  OrganizationCustomPermissionKey,
  OrganizationCustomRoleKey,
  RedirectOptions,
} from '@clerk/types';
import { defineComponent, watchEffect } from 'vue';

import { useAuth } from '../composables/useAuth';
import { useClerk } from '../composables/useClerk';
import { useClerkContext } from '../composables/useClerkContext';

export const SignedIn = defineComponent((_, { slots }) => {
  const { userId } = useAuth();

  return () => (userId.value ? slots.default?.() : null);
});

export const SignedOut = defineComponent((_, { slots }) => {
  const { userId } = useAuth();

  return () => (userId.value === null ? slots.default?.() : null);
});

export const ClerkLoaded = defineComponent((_, { slots }) => {
  const clerk = useClerk();

  return () => (clerk.value?.loaded ? slots.default?.() : null);
});

export const ClerkLoading = defineComponent((_, { slots }) => {
  const clerk = useClerk();

  return () => (!clerk.value?.loaded ? slots.default?.() : null);
});

export const RedirectToSignIn = defineComponent((props: RedirectOptions) => {
  const { sessionCtx, clientCtx } = useClerkContext();
  const clerk = useClerk();

  watchEffect(() => {
    if (!clerk.value) {
      return;
    }

    const hasActiveSessions = clientCtx.value?.activeSessions && clientCtx.value.activeSessions.length > 0;

    if (sessionCtx.value === null && hasActiveSessions) {
      void clerk.value.redirectToAfterSignOut();
    } else {
      void clerk.value.redirectToSignIn(props);
    }
  });

  return () => null;
});

export const RedirectToSignUp = defineComponent((props: RedirectOptions) => {
  const clerk = useClerk();

  watchEffect(() => {
    if (!clerk.value) {
      return;
    }

    void clerk.value.redirectToSignUp(props);
  });

  return () => null;
});

export const RedirectToUserProfile = defineComponent(() => {
  const clerk = useClerk();

  watchEffect(() => {
    if (!clerk.value) {
      return;
    }

    void clerk.value.redirectToUserProfile();
  });

  return () => null;
});

export const RedirectToOrganizationProfile = defineComponent(() => {
  const clerk = useClerk();

  watchEffect(() => {
    if (!clerk.value) {
      return;
    }

    void clerk.value.redirectToOrganizationProfile();
  });

  return () => null;
});

export const RedirectToCreateOrganization = defineComponent(() => {
  const clerk = useClerk();

  watchEffect(() => {
    if (!clerk.value) {
      return;
    }

    void clerk.value.redirectToCreateOrganization();
  });

  return () => null;
});

// TODO: Fix this later and export `Transferable` type from @clerk/types
// to fix the exported variable error in TS
type HandleOAuthCallbackParams = Omit<HandleOAuthCallbackParamsOriginal, 'transferable'> & {
  /**
   * Indicates whether or not sign in attempts are transferable to the sign up flow.
   * When set to false, prevents opaque sign ups when a user attempts to sign in via OAuth with an email that doesn't exist.
   * @default true
   */
  transferable?: boolean;
};

export const AuthenticateWithRedirectCallback = defineComponent((props: HandleOAuthCallbackParams) => {
  const clerk = useClerk();

  watchEffect(() => {
    if (!clerk.value) {
      return;
    }

    void clerk.value.handleRedirectCallback(props);
  });

  return () => null;
});

export type ProtectProps =
  | {
      condition?: never;
      role: OrganizationCustomRoleKey;
      permission?: never;
    }
  | {
      condition?: never;
      role?: never;
      permission: OrganizationCustomPermissionKey;
    }
  | {
      condition: (has: CheckAuthorizationWithCustomPermissions) => boolean;
      role?: never;
      permission?: never;
    }
  | {
      condition?: never;
      role?: never;
      permission?: never;
    };

export const Protect = defineComponent((props: ProtectProps, { slots }) => {
  const { isLoaded, has, userId } = useAuth();

  return () => {
    /**
     * Avoid flickering children or fallback while clerk is loading sessionId or userId
     */
    if (!isLoaded.value) {
      return null;
    }

    /**
     * Fallback to UI provided by user or `null` if authorization checks failed
     */
    if (!userId.value) {
      return slots.fallback?.();
    }

    /**
     * Check against the results of `has` called inside the callback
     */
    if (typeof props.condition === 'function') {
      if (props.condition(has.value!)) {
        return slots.default?.();
      }

      return slots.fallback?.();
    }

    if (props.role || props.permission) {
      if (has.value?.(props)) {
        return slots.default?.();
      }

      return slots.fallback?.();
    }

    /**
     * If neither of the authorization params are passed behave as the `<SignedIn/>`.
     * If fallback is present render that instead of rendering nothing.
     */
    return slots.default?.();
  };
});
