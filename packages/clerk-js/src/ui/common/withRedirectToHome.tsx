import type { SignInProps, SignUpProps } from '@clerk/types';
import React from 'react';

import { canShowOrganizationProfile, canShowSignIn, canShowSignUp, canShowUserProfile } from '../../utils';
import { useCoreClerk, useEnvironment } from '../contexts';
import { useNavigate } from '../hooks';

export function withRedirectToHome<P extends SignInProps | SignUpProps | { continueExisting?: boolean }>(
  Component: React.ComponentType<P>,
  when: 'signIn' | 'signUp' | 'userProfile' | 'organizationProfile',
): (props: P) => null | JSX.Element {
  const displayName = Component.displayName || Component.name || 'Component';
  Component.displayName = displayName;

  const HOC = (props: P) => {
    const { navigate } = useNavigate();
    const clerk = useCoreClerk();
    const environment = useEnvironment();

    let shouldRedirect = false;
    let warning = '';
    switch (when) {
      case 'signIn':
        if (!canShowSignIn(clerk, environment)) {
          shouldRedirect = true;
          warning =
            'Cannot render SignIn because a session exists and single session mode is enabled. Redirecting to the home url...';
        }
        break;
      case 'signUp':
        if (!canShowSignUp(clerk, environment)) {
          shouldRedirect = true;
          warning =
            'Cannot render SignUp because a session exists and single session mode is enabled. Redirecting to the home url...';
        }
        break;
      case 'userProfile':
        if (!canShowUserProfile(clerk)) {
          shouldRedirect = true;
          warning = 'Cannot render UserProfile because no user exists. Redirecting to the home url...';
        }
        break;
      case 'organizationProfile':
        if (!canShowOrganizationProfile(clerk)) {
          shouldRedirect = true;
          warning =
            'Cannot render OrganizationProfile because no active organization exists. Redirecting to the home url...';
        }
        break;
    }

    React.useEffect(() => {
      if (shouldRedirect) {
        if (warning) {
          console.warn(warning);
        }
        navigate(environment.displayConfig.homeUrl);
      }
    }, []);

    if (shouldRedirect) {
      return null;
    }

    return <Component {...props} />;
  };

  HOC.displayName = `withRedirectToHome(${displayName})`;

  return HOC;
}
