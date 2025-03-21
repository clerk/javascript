import { deprecated } from '@clerk/shared/deprecated';
import type {
  CheckAuthorizationWithCustomPermissions,
  HandleOAuthCallbackParams,
  OrganizationCustomPermissionKey,
  OrganizationCustomRoleKey,
} from '@clerk/types';
import React from 'react';

import { useAuthContext } from '../contexts/AuthContext';
import { useIsomorphicClerkContext } from '../contexts/IsomorphicClerkContext';
import { useSessionContext } from '../contexts/SessionContext';
import { useAuth } from '../hooks';
import { useAssertWrappedByClerkProvider } from '../hooks/useAssertWrappedByClerkProvider';
import type { RedirectToSignInProps, RedirectToSignUpProps, WithClerkProp } from '../types';
import { withClerk } from './withClerk';

export const SignedIn = ({ children }: React.PropsWithChildren<unknown>) => {
  useAssertWrappedByClerkProvider('SignedIn');

  const { userId } = useAuthContext();
  if (userId) {
    return children;
  }
  return null;
};

export const SignedOut = ({ children }: React.PropsWithChildren<unknown>) => {
  useAssertWrappedByClerkProvider('SignedOut');

  const { userId } = useAuthContext();
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
  if (isomorphicClerk.loaded) {
    return null;
  }
  return children;
};

export type ProtectProps = React.PropsWithChildren<
  (
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
      }
  ) & {
    fallback?: React.ReactNode;
  }
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
export const Protect = ({ children, fallback, ...restAuthorizedParams }: ProtectProps) => {
  useAssertWrappedByClerkProvider('Protect');

  const { isLoaded, has, userId } = useAuth();

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

  if (restAuthorizedParams.role || restAuthorizedParams.permission) {
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

  const hasSignedInSessions = client.signedInSessions
    ? client.signedInSessions.length > 0
    : // Compat for clerk-js<5.54.0 (which was released with the `signedInSessions` property)
      client.activeSessions && client.activeSessions.length > 0;

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

/**
 * @deprecated Use [`redirectToUserProfile()`](https://clerk.com/docs/references/javascript/clerk/redirect-methods#redirect-to-user-profile) instead, will be removed in the next major version.
 */
export const RedirectToUserProfile = withClerk(({ clerk }) => {
  React.useEffect(() => {
    deprecated('RedirectToUserProfile', 'Use the `redirectToUserProfile()` method instead.');
    void clerk.redirectToUserProfile();
  }, []);

  return null;
}, 'RedirectToUserProfile');

/**
 * @deprecated Use [`redirectToOrganizationProfile()`](https://clerk.com/docs/references/javascript/clerk/redirect-methods#redirect-to-organization-profile) instead, will be removed in the next major version.
 */
export const RedirectToOrganizationProfile = withClerk(({ clerk }) => {
  React.useEffect(() => {
    deprecated('RedirectToOrganizationProfile', 'Use the `redirectToOrganizationProfile()` method instead.');
    void clerk.redirectToOrganizationProfile();
  }, []);

  return null;
}, 'RedirectToOrganizationProfile');

/**
 * @deprecated Use [`redirectToCreateOrganization()`](https://clerk.com/docs/references/javascript/clerk/redirect-methods#redirect-to-create-organization) instead, will be removed in the next major version.
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
