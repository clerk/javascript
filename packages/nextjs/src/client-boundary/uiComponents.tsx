'use client';

import {
  CreateOrganization as BaseCreateOrganization,
  OrganizationProfile as BaseOrganizationProfile,
  SignIn as BaseSignIn,
  SignUp as BaseSignUp,
  UserProfile as BaseUserProfile,
} from '@clerk/clerk-react';
import { useRoutingProps } from '@clerk/clerk-react/internal';
import type {
  CreateOrganizationProps,
  OrganizationProfileProps,
  SignInProps,
  SignUpProps,
  UserProfileProps,
} from '@clerk/types';
import React from 'react';

import { usePathnameWithoutWithCatchAll } from './usePathnameWithoutCatchAll';

export {
  OrganizationList,
  OrganizationSwitcher,
  SignInButton,
  SignInWithMetamaskButton,
  SignOutButton,
  SignUpButton,
  UserButton,
  OneTap,
} from '@clerk/clerk-react';

// The assignment of UserProfile with BaseUserProfile props is used
// to support the CustomPage functionality (eg UserProfile.Page)
// Also the `typeof BaseUserProfile` is used to resolved the following error:
// "The inferred type of 'UserProfile' cannot be named without a reference to ..."
export const UserProfile: typeof BaseUserProfile = Object.assign(
  (props: UserProfileProps) => {
    const path = usePathnameWithoutWithCatchAll();
    return <BaseUserProfile {...useRoutingProps('UserProfile', props, { path })} />;
  },
  { ...BaseUserProfile },
);

export const CreateOrganization = (props: CreateOrganizationProps) => {
  const path = usePathnameWithoutWithCatchAll();
  return <BaseCreateOrganization {...useRoutingProps('CreateOrganization', props, { path })} />;
};

// The assignment of OrganizationProfile with BaseOrganizationProfile props is used
// to support the CustomPage functionality (eg OrganizationProfile.Page)
// Also the `typeof BaseOrganizationProfile` is used to resolved the following error:
// "The inferred type of 'OrganizationProfile' cannot be named without a reference to ..."
export const OrganizationProfile: typeof BaseOrganizationProfile = Object.assign(
  (props: OrganizationProfileProps) => {
    const path = usePathnameWithoutWithCatchAll();
    return <BaseOrganizationProfile {...useRoutingProps('OrganizationProfile', props, { path })} />;
  },
  { ...BaseOrganizationProfile },
);

export const SignIn = (props: SignInProps) => {
  const path = usePathnameWithoutWithCatchAll();
  return <BaseSignIn {...useRoutingProps('SignIn', props, { path })} />;
};

export const SignUp = (props: SignUpProps) => {
  const path = usePathnameWithoutWithCatchAll();
  return <BaseSignUp {...useRoutingProps('SignUp', props, { path })} />;
};
