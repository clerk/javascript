'use client';

import { SignIn as BaseSignIn, SignUp as BaseSignUp } from '@clerk/clerk-react';
import type { SignInProps, SignUpProps } from '@clerk/types';
import React from 'react';

import { useClerkNextOptions } from './NextOptionsContext';

export {
  CreateOrganization,
  OrganizationList,
  OrganizationProfile,
  OrganizationSwitcher,
  SignInButton,
  SignInWithMetamaskButton,
  SignOutButton,
  SignUpButton,
  UserButton,
  UserProfile,
} from '@clerk/clerk-react';

export const SignIn = (props: SignInProps) => {
  const { signInUrl: repoLevelSignInUrl } = useClerkNextOptions();
  const { routing: _routing, path, ...restProps } = props;

  if (repoLevelSignInUrl || path) {
    return (
      <BaseSignIn
        routing='path'
        path={path || repoLevelSignInUrl}
        {...restProps}
      />
    );
  }

  return <BaseSignIn {...props} />;
};

export const SignUp = (props: SignUpProps) => {
  const { signUpUrl: repoLevelSignUpUrl } = useClerkNextOptions();
  const { routing: _routing, path, ...restProps } = props;

  if (repoLevelSignUpUrl || path) {
    return (
      <BaseSignUp
        routing='path'
        path={path || repoLevelSignUpUrl}
        {...restProps}
      />
    );
  }
  return <BaseSignUp {...restProps} />;
};
