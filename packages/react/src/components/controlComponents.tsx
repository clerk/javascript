import { HandleOAuthCallbackParams } from '@clerk/types';
import React from 'react';

import { useAuthContext } from '../contexts/AuthContext';
import { useIsomorphicClerkContext } from '../contexts/IsomorphicClerkContext';
import { useSessionContext } from '../contexts/SessionContext';
import { LoadedGuarantee } from '../contexts/StructureContext';
import type { RedirectToProps, WithClerkProp } from '../types';
import { withClerk } from './withClerk';

export const SignedIn: React.FC<React.PropsWithChildren<unknown>> = ({ children }) => {
  const { userId } = useAuthContext();
  if (userId) {
    return <>{children}</>;
  }
  return null;
};

export const SignedOut: React.FC<React.PropsWithChildren<unknown>> = ({ children }) => {
  const { userId } = useAuthContext();
  if (userId === null) {
    return <>{children}</>;
  }
  return null;
};

export const ClerkLoaded: React.FC<React.PropsWithChildren<unknown>> = ({ children }) => {
  const isomorphicClerk = useIsomorphicClerkContext();
  if (!isomorphicClerk.loaded) {
    return null;
  }
  return <LoadedGuarantee>{children}</LoadedGuarantee>;
};

export const ClerkLoading: React.FC<React.PropsWithChildren<unknown>> = ({ children }) => {
  const isomorphicClerk = useIsomorphicClerkContext();
  if (isomorphicClerk.loaded) {
    return null;
  }
  return <>{children}</>;
};

export const RedirectToSignIn = withClerk(({ clerk, ...props }: WithClerkProp<RedirectToProps>) => {
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

export const RedirectToSignUp = withClerk(({ clerk, ...props }: WithClerkProp<RedirectToProps>) => {
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

export const AuthenticateWithRedirectCallback = withClerk(
  ({ clerk, ...handleRedirectCallbackParams }: WithClerkProp<HandleOAuthCallbackParams>) => {
    React.useEffect(() => {
      void clerk.handleRedirectCallback(handleRedirectCallbackParams);
    }, []);

    return null;
  },
  'AuthenticateWithRedirectCallback',
);

export const MultisessionAppSupport: React.FC<React.PropsWithChildren<unknown>> = ({ children }) => {
  const session = useSessionContext();
  return <React.Fragment key={session ? session.id : 'no-users'}>{children}</React.Fragment>;
};
