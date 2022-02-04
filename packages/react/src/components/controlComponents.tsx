import { HandleOAuthCallbackParams } from '@clerk/types';
import React from 'react';

import { withClerk, withUser } from '../contexts';
import { useUserContext } from '../contexts/UserContext';
import type { RedirectToProps, WithClerkProp } from '../types';

export const SignedIn: React.FC = withUser(({ children }) => {
  return <>{children}</>;
}, 'SignedIn');

export const SignedOut: React.FC = withClerk(({ children }) => {
  const userCtx = useUserContext();
  return userCtx.value === null ? <>{children}</> : null;
}, 'SignedOut');

export const ClerkLoaded: React.FC = withClerk(({ children }) => {
  return <>{children}</>;
}, 'ClerkLoaded');

export const ClerkLoading: React.FC = ({ children }) => {
  const userCtx = useUserContext();
  return userCtx.value === undefined ? <>{children}</> : null;
};

// DX: returnBack deprecated <=2.4.2
// Deprecate the boolean type before removing returnBack
export const RedirectToSignIn = withClerk(
  ({ clerk, ...props }: WithClerkProp<RedirectToProps>) => {
    const { returnBack, afterSignUpUrl, redirectUrl, afterSignInUrl } = props;
    const redirectOptions = { afterSignUpUrl, redirectUrl, afterSignInUrl };

    const { client, session } = clerk;
    // TODO: Remove temp use of __unstable__environment
    const { __unstable__environment } = clerk as any;

    const hasActiveSessions =
      client.activeSessions && client.activeSessions.length > 0;
    React.useEffect(() => {
      if (session === null && hasActiveSessions && __unstable__environment) {
        const { afterSignOutOneUrl } = __unstable__environment.displayConfig;
        void clerk.navigate(afterSignOutOneUrl);
      } else {
        void clerk.redirectToSignIn((returnBack || redirectOptions) as any);
      }
    }, []);
    return null;
  },
  'RedirectToSignIn',
);

// DX: returnBack deprecated <=2.4.2
// Deprecate the boolean type before removing returnBack
export const RedirectToSignUp = withClerk(
  ({ clerk, ...props }: WithClerkProp<RedirectToProps>) => {
    const { returnBack, afterSignUpUrl, redirectUrl, afterSignInUrl } = props;
    const redirectOptions = { afterSignUpUrl, redirectUrl, afterSignInUrl };

    React.useEffect(() => {
      void clerk.redirectToSignUp((returnBack || redirectOptions) as any);
    }, []);
    return null;
  },
  'RedirectToSignUp',
);

export const RedirectToUserProfile = withClerk(({ clerk }) => {
  React.useEffect(() => {
    clerk.redirectToUserProfile();
  }, []);
  return null;
}, 'RedirectToUserProfile');

export const AuthenticateWithRedirectCallback = withClerk(
  ({
    clerk,
    ...handleRedirectCallbackParams
  }: WithClerkProp<HandleOAuthCallbackParams>) => {
    React.useEffect(() => {
      void clerk.handleRedirectCallback(handleRedirectCallbackParams);
    }, []);
    return null;
  },
  'AuthenticateWithRedirectCallback',
);
