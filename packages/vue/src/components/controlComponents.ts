import { deprecated } from '@clerk/shared/deprecated';
import type {
  HandleOAuthCallbackParams,
  PendingSessionOptions,
  ProtectProps as _ProtectProps,
  RedirectOptions,
} from '@clerk/shared/types';
import { defineComponent } from 'vue';

import { useAuth } from '../composables/useAuth';
import { useClerk } from '../composables/useClerk';
import { useClerkContext } from '../composables/useClerkContext';
import { useClerkLoaded } from '../utils/useClerkLoaded';

export const SignedIn = defineComponent<PendingSessionOptions>(({ treatPendingAsSignedOut }, { slots }) => {
  const { userId } = useAuth({ treatPendingAsSignedOut });

  return () => (userId.value ? slots.default?.() : null);
});

export const SignedOut = defineComponent<PendingSessionOptions>(({ treatPendingAsSignedOut }, { slots }) => {
  const { userId } = useAuth({ treatPendingAsSignedOut });

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
  const { sessionCtx, clientCtx } = useClerkContext('RedirectToSignIn');

  useClerkLoaded(clerk => {
    const hasSignedInSessions = clientCtx.value?.signedInSessions && clientCtx.value.signedInSessions.length > 0;

    if (sessionCtx.value === null && hasSignedInSessions) {
      void clerk.redirectToAfterSignOut();
    } else {
      void clerk.redirectToSignIn(props);
    }
  });

  return () => null;
});

export const RedirectToSignUp = defineComponent((props: RedirectOptions) => {
  useClerkLoaded(clerk => {
    void clerk.redirectToSignUp(props);
  });

  return () => null;
});

export const RedirectToTasks = defineComponent((props: RedirectOptions) => {
  useClerkLoaded(clerk => {
    void clerk.redirectToTasks(props);
  });

  return () => null;
});

/**
 * @deprecated Use [`redirectToUserProfile()`](https://clerk.com/docs/reference/javascript/clerk/redirect-methods#redirect-to-user-profile) instead.
 */
export const RedirectToUserProfile = defineComponent(() => {
  useClerkLoaded(clerk => {
    deprecated('RedirectToUserProfile', 'Use the `redirectToUserProfile()` method instead.');
    void clerk.redirectToUserProfile();
  });

  return () => null;
});

/**
 * @deprecated Use [`redirectToOrganizationProfile()`](https://clerk.com/docs/reference/javascript/clerk/redirect-methods#redirect-to-organization-profile) instead.
 */
export const RedirectToOrganizationProfile = defineComponent(() => {
  useClerkLoaded(clerk => {
    deprecated('RedirectToOrganizationProfile', 'Use the `redirectToOrganizationProfile()` method instead.');
    void clerk.redirectToOrganizationProfile();
  });

  return () => null;
});

/**
 * @deprecated Use [`redirectToCreateOrganization()`](https://clerk.com/docs/reference/javascript/clerk/redirect-methods#redirect-to-create-organization) instead.
 */
export const RedirectToCreateOrganization = defineComponent(() => {
  useClerkLoaded(clerk => {
    deprecated('RedirectToCreateOrganization', 'Use the `redirectToCreateOrganization()` method instead.');
    void clerk.redirectToCreateOrganization();
  });

  return () => null;
});

export const AuthenticateWithRedirectCallback = defineComponent((props: HandleOAuthCallbackParams) => {
  useClerkLoaded(clerk => {
    void clerk.handleRedirectCallback(props);
  });

  return () => null;
});

export type ProtectProps = _ProtectProps & PendingSessionOptions;

export const Protect = defineComponent((props: ProtectProps, { slots }) => {
  const { isLoaded, has, userId } = useAuth({ treatPendingAsSignedOut: props.treatPendingAsSignedOut });

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
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      if (props.condition(has.value!)) {
        return slots.default?.();
      }

      return slots.fallback?.();
    }

    if (props.role || props.permission || props.feature || props.plan) {
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
