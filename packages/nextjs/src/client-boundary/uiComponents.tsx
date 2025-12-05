'use client';

import {
  OrganizationProfile as BaseOrganizationProfile,
  SignIn as BaseSignIn,
  SignUp as BaseSignUp,
  UserProfile as BaseUserProfile,
} from '@clerk/react';
import type { ComponentProps } from 'react';
import React from 'react';

import { useEnforceCorrectRoutingProps } from './hooks/useEnforceRoutingProps';

export {
  APIKeys,
  CreateOrganization,
  GoogleOneTap,
  OrganizationList,
  OrganizationSwitcher,
  PricingTable,
  SignInButton,
  SignInWithMetamaskButton,
  SignOutButton,
  SignUpButton,
  TaskChooseOrganization,
  TaskResetPassword,
  UserAvatar,
  UserButton,
  Waitlist,
} from '@clerk/react';

// The assignment of UserProfile with BaseUserProfile props is used
// to support the CustomPage functionality (eg UserProfile.Page)
// Also the `typeof BaseUserProfile` is used to resolve the following error:
// "The inferred type of 'UserProfile' cannot be named without a reference to ..."
export const UserProfile: typeof BaseUserProfile = Object.assign(
  (props: ComponentProps<typeof BaseUserProfile>) => {
    return <BaseUserProfile {...useEnforceCorrectRoutingProps('UserProfile', props)} />;
  },
  { ...BaseUserProfile },
);

// The assignment of OrganizationProfile with BaseOrganizationProfile props is used
// to support the CustomPage functionality (eg OrganizationProfile.Page)
// Also the `typeof BaseOrganizationProfile` is used to resolved the following error:
// "The inferred type of 'OrganizationProfile' cannot be named without a reference to ..."
export const OrganizationProfile: typeof BaseOrganizationProfile = Object.assign(
  (props: ComponentProps<typeof BaseOrganizationProfile>) => {
    return <BaseOrganizationProfile {...useEnforceCorrectRoutingProps('OrganizationProfile', props)} />;
  },
  { ...BaseOrganizationProfile },
);

export const SignIn = (props: ComponentProps<typeof BaseSignIn>) => {
  return <BaseSignIn {...useEnforceCorrectRoutingProps('SignIn', props, false)} />;
};

export const SignUp = (props: ComponentProps<typeof BaseSignUp>) => {
  return <BaseSignUp {...useEnforceCorrectRoutingProps('SignUp', props, false)} />;
};
