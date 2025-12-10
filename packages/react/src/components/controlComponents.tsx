import { deprecated } from '@clerk/shared/deprecated';
import type {
  HandleOAuthCallbackParams,
  PendingSessionOptions,
  ProtectProps as _ProtectProps,
} from '@clerk/shared/types';
import React from 'react';

import { useIsomorphicClerkContext } from '../contexts/IsomorphicClerkContext';
import { useSessionContext } from '../contexts/SessionContext';
import { useAuth } from '../hooks';
import { useAssertWrappedByClerkProvider } from '../hooks/useAssertWrappedByClerkProvider';
import type { RedirectToSignInProps, RedirectToSignUpProps, RedirectToTasksProps, WithClerkProp } from '../types';
import { withClerk } from './withClerk';

export const SignedIn = ({ children, treatPendingAsSignedOut }: React.PropsWithChildren<PendingSessionOptions>) => {
  useAssertWrappedByClerkProvider('SignedIn');

  const { userId } = useAuth({ treatPendingAsSignedOut });
  if (userId) {
    return children;
  }
  return null;
};

export const SignedOut = ({ children, treatPendingAsSignedOut }: React.PropsWithChildren<PendingSessionOptions>) => {
  useAssertWrappedByClerkProvider('SignedOut');

  const { userId } = useAuth({ treatPendingAsSignedOut });
  if (userId === null) {
    return children;
  }
  return null;
};

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

export type ProtectProps = React.PropsWithChildren<
  _ProtectProps & {
    fallback?: React.ReactNode;
  } & PendingSessionOptions
>;

/**
 * Use `<Protect/>` in order to prevent unauthenticated or unauthorized users from accessing the children passed to the component.
 *
 * Examples:
 * ```
 * <Protect permission="a_permission_key" />
 * <Protect role="a_role_key" />
 * <Protect condition={(has) => has({permission:"a_permission_key"})} />
 * <Protect condition={(has) => has({role:"a_role_key"})} />
 * <Protect fallback={<p>Unauthorized</p>} />
 * ```
 */
export const Protect = ({ children, fallback, treatPendingAsSignedOut, ...restAuthorizedParams }: ProtectProps) => {
  useAssertWrappedByClerkProvider('Protect');

  const { isLoaded, has, userId } = useAuth({ treatPendingAsSignedOut });

  /**
   * Avoid flickering children or fallback while clerk is loading sessionId or userId
   */
  if (!isLoaded) {
    return null;
  }

  /**
   * Fallback to UI provided by user or `null` if authorization checks failed
   */
  const unauthorized = fallback ?? null;

  const authorized = children;

  if (!userId) {
    return unauthorized;
  }

  /**
   * Check against the results of `has` called inside the callback
   */
  if (typeof restAuthorizedParams.condition === 'function') {
    if (restAuthorizedParams.condition(has)) {
      return authorized;
    }
    return unauthorized;
  }

  if (
    restAuthorizedParams.role ||
    restAuthorizedParams.permission ||
    restAuthorizedParams.feature ||
    restAuthorizedParams.plan
  ) {
    if (has(restAuthorizedParams)) {
      return authorized;
    }
    return unauthorized;
  }

  /**
   * If neither of the authorization params are passed behave as the `<SignedIn/>`.
   * If fallback is present render that instead of rendering nothing.
   */
  return authorized;
};

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
