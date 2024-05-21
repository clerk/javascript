'use client';

import {
  CreateOrganization as BaseCreateOrganization,
  OrganizationProfile as BaseOrganizationProfile,
  SignIn as BaseSignIn,
  SignUp as BaseSignUp,
  UserProfile as BaseUserProfile,
} from '@clerk/clerk-react';
import type {
  CreateOrganizationProps,
  OrganizationProfileProps,
  SignInProps,
  SignUpProps,
  UserProfileProps,
} from '@clerk/types';
import React from 'react';

import { useEnforceCorrectRoutingProps } from './hooks/useEnforceRoutingProps';

export {
  OrganizationList,
  OrganizationSwitcher,
  SignInButton,
  SignInWithMetamaskButton,
  SignOutButton,
  SignUpButton,
  UserButton,
  GoogleOneTap,
} from '@clerk/clerk-react';

// The assignment of UserProfile with BaseUserProfile props is used
// to support the CustomPage functionality (eg UserProfile.Page)
// Also the `typeof BaseUserProfile` is used to resolve the following error:
// "The inferred type of 'UserProfile' cannot be named without a reference to ..."
export const UserProfile: typeof BaseUserProfile = Object.assign(
  (props: UserProfileProps) => {
    return <BaseUserProfile {...useEnforceCorrectRoutingProps('UserProfile', props)} />;
  },
  { ...BaseUserProfile },
);

export const CreateOrganization = (props: CreateOrganizationProps) => {
  return <BaseCreateOrganization {...useEnforceCorrectRoutingProps('CreateOrganization', props)} />;
};

// The assignment of OrganizationProfile with BaseOrganizationProfile props is used
// to support the CustomPage functionality (eg OrganizationProfile.Page)
// Also the `typeof BaseOrganizationProfile` is used to resolved the following error:
// "The inferred type of 'OrganizationProfile' cannot be named without a reference to ..."
export const OrganizationProfile: typeof BaseOrganizationProfile = Object.assign(
  (props: OrganizationProfileProps) => {
    return <BaseOrganizationProfile {...useEnforceCorrectRoutingProps('OrganizationProfile', props)} />;
  },
  { ...BaseOrganizationProfile },
);

export const SignIn = (props: SignInProps) => {
  return <BaseSignIn {...useEnforceCorrectRoutingProps('SignIn', props, false)} />;
};

export const SignUp = (props: SignUpProps) => {
  return <BaseSignUp {...useEnforceCorrectRoutingProps('SignUp', props, false)} />;
};
