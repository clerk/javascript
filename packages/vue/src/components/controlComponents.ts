import { deprecated } from '@clerk/shared/deprecated';
import type {
  HandleOAuthCallbackParams,
  PendingSessionOptions,
  RedirectOptions,
  ShowWhenCondition,
} from '@clerk/shared/types';
import { defineComponent, type VNodeChild } from 'vue';

import { useAuth } from '../composables/useAuth';
import { useClerk } from '../composables/useClerk';
import { useClerkContext } from '../composables/useClerkContext';
import { useClerkLoaded } from '../utils/useClerkLoaded';

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

/**
 * Props for `<Show>` that control when content renders based on sign-in or authorization state.
 *
 * @public
 * @property fallback Optional content shown when the condition fails; can be provided via prop or `fallback` slot.
 * @property when Condition controlling visibility; supports `"signedIn"`, `"signedOut"`, authorization descriptors, or a predicate that receives the `has` helper.
 * @property treatPendingAsSignedOut Inherited from `PendingSessionOptions`; treat pending sessions as signed out while loading.
 * @example
 * ```vue
 * <Show :when="{ role: 'admin' }" fallback="Access denied">
 *   <AdminPanel />
 * </Show>
 *
 * <Show :when="(has) => has({ permission: 'org:read' })">
 *   <template #fallback>Not authorized</template>
 *   <ProtectedFeature />
 * </Show>
 * ```
 */
export type ShowProps = PendingSessionOptions & { fallback?: unknown; when: ShowWhenCondition };

export const Show = defineComponent((props: ShowProps, { slots }) => {
  const { isLoaded, has, userId } = useAuth({ treatPendingAsSignedOut: props.treatPendingAsSignedOut });

  return () => {
    /**
     * Avoid flickering children or fallback while clerk is loading sessionId or userId
     */
    if (!isLoaded.value) {
      return null;
    }

    const authorized = (slots.default?.() ?? null) as VNodeChild | null;
    const fallbackFromSlot = slots.fallback?.() ?? null;
    const fallbackFromProp = (props.fallback as VNodeChild | null | undefined) ?? null;
    const unauthorized = (fallbackFromSlot ?? fallbackFromProp ?? null) as VNodeChild | null;

    if (props.when === 'signedOut') {
      return userId.value ? unauthorized : authorized;
    }

    if (!userId.value) {
      return unauthorized;
    }

    if (props.when === 'signedIn') {
      return authorized;
    }

    const hasValue = has.value;

    if (!hasValue) {
      return unauthorized;
    }

    if (typeof props.when === 'function') {
      return props.when(hasValue) ? authorized : unauthorized;
    }

    return hasValue(props.when) ? authorized : unauthorized;
  };
});
