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
  const { routing: _routing, path: _path, ...restProps } = props;

  if (repoLevelSignInUrl) {
    return (
      <BaseSignIn
        routing='path'
        path={repoLevelSignInUrl}
        {...restProps}
      />
    );
  }
  return <BaseSignIn {...props} />;
};

export const SignUp = (props: SignUpProps) => {
  const { signUpUrl: repoLevelSignUpUrl } = useClerkNextOptions();
  const { routing, path, ...restProps } = props;

  if (repoLevelSignUpUrl) {
    return (
      <BaseSignUp
        routing='path'
        path={repoLevelSignUpUrl}
        {...restProps}
      />
    );
  }
  return <BaseSignUp {...props} />;
};
