'use client';

import { SignIn as BaseSignIn, SignUp as BaseSignUp } from '@clerk/clerk-react';
import type { SignInProps, SignUpProps } from '@clerk/types';
import React from 'react';

import { useClerkNextOptions } from './NextOptionsContext';

export {
  UserProfile,
  UserButton,
  OrganizationSwitcher,
  OrganizationProfile,
  CreateOrganization,
  SignInButton,
  SignUpButton,
  SignOutButton,
  OrganizationList,
} from '@clerk/clerk-react';

export const SignIn = (props: SignInProps) => {
  const { signInUrl: repoLevelSignInUrl } = useClerkNextOptions();
  if (repoLevelSignInUrl) {
    return (
      <BaseSignIn
        routing='path'
        path={repoLevelSignInUrl}
        {...props}
      />
    );
  }
  return <BaseSignIn {...props} />;
};

export const SignUp = (props: SignUpProps) => {
  const { signUpUrl: repoLevelSignUpUrl } = useClerkNextOptions();
  if (repoLevelSignUpUrl) {
    return (
      <BaseSignUp
        routing='path'
        path={repoLevelSignUpUrl}
        {...props}
      />
    );
  }
  return <BaseSignUp {...props} />;
};
