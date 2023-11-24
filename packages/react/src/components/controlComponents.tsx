import type { experimental__CheckAuthorizationWithCustomPermissions, HandleOAuthCallbackParams } from '@clerk/types';
import React from 'react';

import { useAuthContext } from '../contexts/AuthContext';
import { useIsomorphicClerkContext } from '../contexts/IsomorphicClerkContext';
import { useSessionContext } from '../contexts/SessionContext';
import { LoadedGuarantee } from '../contexts/StructureContext';
import { useAuth } from '../hooks';
import type { RedirectToSignInProps, RedirectToSignUpProps, WithClerkProp } from '../types';
import { withClerk } from './withClerk';

export const SignedIn = ({ children }: React.PropsWithChildren<unknown>): JSX.Element | null => {
  const { userId } = useAuthContext();
  if (userId) {
    return <>{children}</>;
  }
  return null;
};

export const SignedOut = ({ children }: React.PropsWithChildren<unknown>): JSX.Element | null => {
  const { userId } = useAuthContext();
  if (userId === null) {
    return <>{children}</>;
  }
  return null;
};

export const ClerkLoaded = ({ children }: React.PropsWithChildren<unknown>): JSX.Element | null => {
  const isomorphicClerk = useIsomorphicClerkContext();
  if (!isomorphicClerk.loaded) {
    return null;
  }
  return <LoadedGuarantee>{children}</LoadedGuarantee>;
};

export const ClerkLoading = ({ children }: React.PropsWithChildren<unknown>): JSX.Element | null => {
  const isomorphicClerk = useIsomorphicClerkContext();
  if (isomorphicClerk.loaded) {
    return null;
  }
  return <>{children}</>;
};

type GateProps<Role extends string = string, Permission extends string = string> = React.PropsWithChildren<
  Parameters<experimental__CheckAuthorizationWithCustomPermissions<Role, Permission>>[0] & {
    fallback?: React.ReactNode;
  }
>;

/**
 * @experimental The component is experimental and subject to change in future releases.
 */
export function experimental__Gate<Role extends string = string, Permission extends string = string>({
  children,
  fallback,
  ...restAuthorizedParams
}: GateProps<Role, Permission>) {
  const { experimental__has } = useAuth<Role, Permission>();

  if (experimental__has(restAuthorizedParams)) {
    return <>{children}</>;
  }

  return <>{fallback ?? null}</>;
}

export const RedirectToSignIn = withClerk(({ clerk, ...props }: WithClerkProp<RedirectToSignInProps>) => {
  const { client, session } = clerk;
  // TODO: Remove temp use of __unstable__environment
  const { __unstable__environment } = clerk as any;

  const hasActiveSessions = client.activeSessions && client.activeSessions.length > 0;

  React.useEffect(() => {
    if (session === null && hasActiveSessions && __unstable__environment) {
      const { afterSignOutOneUrl } = __unstable__environment.displayConfig;
      void clerk.navigate(afterSignOutOneUrl);
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

export const RedirectToUserProfile = withClerk(({ clerk }) => {
  React.useEffect(() => {
    clerk.redirectToUserProfile();
  }, []);

  return null;
}, 'RedirectToUserProfile');

export const RedirectToOrganizationProfile = withClerk(({ clerk }) => {
  React.useEffect(() => {
    clerk.redirectToOrganizationProfile();
  }, []);

  return null;
}, 'RedirectToOrganizationProfile');

export const RedirectToCreateOrganization = withClerk(({ clerk }) => {
  React.useEffect(() => {
    clerk.redirectToCreateOrganization();
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

export const MultisessionAppSupport = ({ children }: React.PropsWithChildren<unknown>): JSX.Element => {
  const session = useSessionContext();
  return <React.Fragment key={session ? session.id : 'no-users'}>{children}</React.Fragment>;
};
