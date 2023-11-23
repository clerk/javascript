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
  const path = props.path || repoLevelSignInUrl;

  if (path) {
    <BaseSignIn
      {...props}
      routing='path'
      path={path}
    />;
  }

  return <BaseSignIn {...props} />;
};

export const SignUp = (props: SignUpProps) => {
  const { signUpUrl: repoLevelSignUpUrl } = useClerkNextOptions();
  const path = props.path || repoLevelSignUpUrl;

  if (path) {
    return (
      <BaseSignUp
        {...props}
        routing='path'
        path={path}
      />
    );
  }

  return <BaseSignUp {...props} />;
};
