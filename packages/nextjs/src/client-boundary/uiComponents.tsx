'use client';

import {
  CreateOrganization as BaseCreateOrganization,
  OrganizationProfile as BaseOrganizationProfile,
  SignIn as BaseSignIn,
  SignUp as BaseSignUp,
  UserProfile as BaseUserProfile,
  withPathDefaultRouting,
} from '@clerk/clerk-react';
import type { SignInProps, SignUpProps } from '@clerk/types';
import React from 'react';

import { useClerkNextOptions } from './NextOptionsContext';

export {
  OrganizationList,
  OrganizationSwitcher,
  SignInButton,
  SignInWithMetamaskButton,
  SignOutButton,
  SignUpButton,
  UserButton,
} from '@clerk/clerk-react';

export const UserProfile = withPathDefaultRouting(BaseUserProfile);
export const CreateOrganization = withPathDefaultRouting(BaseCreateOrganization);
export const OrganizationProfile = withPathDefaultRouting(BaseOrganizationProfile);

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
