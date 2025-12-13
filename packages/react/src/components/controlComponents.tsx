import { deprecated } from '@clerk/shared/deprecated';
import type { HandleOAuthCallbackParams, PendingSessionOptions, ShowWhenCondition } from '@clerk/shared/types';
import React from 'react';

import { useIsomorphicClerkContext } from '../contexts/IsomorphicClerkContext';
import { useSessionContext } from '../contexts/SessionContext';
import { useAuth } from '../hooks';
import { useAssertWrappedByClerkProvider } from '../hooks/useAssertWrappedByClerkProvider';
import type { RedirectToSignInProps, RedirectToSignUpProps, RedirectToTasksProps, WithClerkProp } from '../types';
import { withClerk } from './withClerk';

export const ClerkLoaded = ({ children }: React.PropsWithChildren<unknown>) => {
  useAssertWrappedByClerkProvider('ClerkLoaded');

  const isomorphicClerk = useIsomorphicClerkContext();
  if (!isomorphicClerk.loaded) {
    return null;
  }
  return children;
};

export const ClerkLoading = ({ children }: React.PropsWithChildren<unknown>) => {
  useAssertWrappedByClerkProvider('ClerkLoading');

  const isomorphicClerk = useIsomorphicClerkContext();
  if (isomorphicClerk.status !== 'loading') {
    return null;
  }
  return children;
};

export const ClerkFailed = ({ children }: React.PropsWithChildren<unknown>) => {
  useAssertWrappedByClerkProvider('ClerkFailed');

  const isomorphicClerk = useIsomorphicClerkContext();
  if (isomorphicClerk.status !== 'error') {
    return null;
  }
  return children;
};

export const ClerkDegraded = ({ children }: React.PropsWithChildren<unknown>) => {
  useAssertWrappedByClerkProvider('ClerkDegraded');

  const isomorphicClerk = useIsomorphicClerkContext();
  if (isomorphicClerk.status !== 'degraded') {
    return null;
  }
  return children;
};

export type ShowProps = React.PropsWithChildren<
  {
    fallback?: React.ReactNode;
    when: ShowWhenCondition;
  } & PendingSessionOptions
>;

/**
 * Use `<Show/>` to conditionally render content based on user authorization or sign-in state.
 * Returns `null` while auth is loading. Set `treatPendingAsSignedOut` to treat
 * pending sessions as signed out during that period.
 *
 * The `when` prop supports:
 * - `"signedIn"` or `"signedOut"` shorthands
 * - Authorization descriptors (e.g., `{ permission: "org:billing:manage" }`, `{ role: "admin" }`)
 * - A predicate function `(has) => boolean` that receives the `has` helper
 *
 * @example
 * ```tsx
 * <Show when={{ permission: "org:billing:manage" }} fallback={<p>Unauthorized</p>}>
 *   <BillingSettings />
 * </Show>
 *
 * <Show when={{ role: "admin" }}>
 *   <AdminPanel />
 * </Show>
 *
 * <Show when={(has) => has({ permission: "org:read" }) && isFeatureEnabled}>
 *   <ProtectedFeature />
 * </Show>
 * ```
 *
 */
export const Show = ({ children, fallback, treatPendingAsSignedOut, when }: ShowProps) => {
  useAssertWrappedByClerkProvider('Show');

  const { has, isLoaded, userId } = useAuth({ treatPendingAsSignedOut });

  if (!isLoaded) {
    return null;
  }

  const resolvedWhen = when;
  const authorized = children;
  const unauthorized = fallback ?? null;

  if (resolvedWhen === 'signedOut') {
    return userId ? unauthorized : authorized;
  }

  if (!userId) {
    return unauthorized;
  }

  if (resolvedWhen === 'signedIn') {
    return authorized;
  }

  if (checkAuthorization(resolvedWhen, has)) {
    return authorized;
  }

  return unauthorized;
};

function checkAuthorization(
  when: Exclude<ShowWhenCondition, 'signedIn' | 'signedOut'>,
  has: NonNullable<ReturnType<typeof useAuth>['has']>,
): boolean {
  if (typeof when === 'function') {
    return when(has);
  }
  return has(when);
}

export const RedirectToSignIn = withClerk(({ clerk, ...props }: WithClerkProp<RedirectToSignInProps>) => {
  const { client, session } = clerk;

  const hasSignedInSessions = (client.signedInSessions?.length ?? 0) > 0;

  React.useEffect(() => {
    if (session === null && hasSignedInSessions) {
      void clerk.redirectToAfterSignOut();
    } else {
      void clerk.redirectToSignIn(props);
    }
  }, []);

  return null;
}, 'RedirectToSignIn');

export const RedirectToSignUp = withClerk(({ clerk, ...props }: WithClerkProp<RedirectToSignUpProps>) => {
  React.useEffect(() => {
    void clerk.redirectToSignUp(props);
  }, []);

  return null;
}, 'RedirectToSignUp');

export const RedirectToTasks = withClerk(({ clerk, ...props }: WithClerkProp<RedirectToTasksProps>) => {
  React.useEffect(() => {
    void clerk.redirectToTasks(props);
  }, []);

  return null;
}, 'RedirectToTasks');

/**
 * @function
 * @deprecated Use [`redirectToUserProfile()`](https://clerk.com/docs/reference/javascript/clerk#redirect-to-user-profile) instead.
 */
export const RedirectToUserProfile = withClerk(({ clerk }) => {
  React.useEffect(() => {
    deprecated('RedirectToUserProfile', 'Use the `redirectToUserProfile()` method instead.');
    void clerk.redirectToUserProfile();
  }, []);

  return null;
}, 'RedirectToUserProfile');

/**
 * @function
 * @deprecated Use [`redirectToOrganizationProfile()`](https://clerk.com/docs/reference/javascript/clerk#redirect-to-organization-profile) instead.
 */
export const RedirectToOrganizationProfile = withClerk(({ clerk }) => {
  React.useEffect(() => {
    deprecated('RedirectToOrganizationProfile', 'Use the `redirectToOrganizationProfile()` method instead.');
    void clerk.redirectToOrganizationProfile();
  }, []);

  return null;
}, 'RedirectToOrganizationProfile');

/**
 * @function
 * @deprecated Use [`redirectToCreateOrganization()`](https://clerk.com/docs/reference/javascript/clerk#redirect-to-create-organization) instead.
 */
export const RedirectToCreateOrganization = withClerk(({ clerk }) => {
  React.useEffect(() => {
    deprecated('RedirectToCreateOrganization', 'Use the `redirectToCreateOrganization()` method instead.');
    void clerk.redirectToCreateOrganization();
  }, []);

  return null;
}, 'RedirectToCreateOrganization');

export const AuthenticateWithRedirectCallback = withClerk(
  ({ clerk, ...handleRedirectCallbackParams }: WithClerkProp<HandleOAuthCallbackParams>) => {
    React.useEffect(() => {
      void clerk.handleRedirectCallback(handleRedirectCallbackParams);
    }, []);

    return null;
  },
  'AuthenticateWithRedirectCallback',
);

export const MultisessionAppSupport = ({ children }: React.PropsWithChildren<unknown>) => {
  useAssertWrappedByClerkProvider('MultisessionAppSupport');

  const session = useSessionContext();
  return <React.Fragment key={session ? session.id : 'no-users'}>{children}</React.Fragment>;
};
