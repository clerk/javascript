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
import { useLocation } from '@remix-run/react';
import React from 'react';

// The assignment of UserProfile with BaseUserProfile props is used
// to support the CustomPage functionality (eg UserProfile.Page)
// Also the `typeof BaseUserProfile` is used to resolved the following error:
// "The inferred type of 'UserProfile' cannot be named without a reference to ..."
export const UserProfile: typeof BaseUserProfile = Object.assign(
  (props: UserProfileProps) => {
    const { pathname: path } = useLocation();
    return <BaseUserProfile {...useRoutingProps('UserProfile', props, { path })} />;
  },
  { ...BaseUserProfile },
);

export const CreateOrganization = (props: CreateOrganizationProps) => {
  const { pathname: path } = useLocation();
  return <BaseCreateOrganization {...useRoutingProps('CreateOrganization', props, { path })} />;
};

// The assignment of OrganizationProfile with BaseOrganizationProfile props is used
// to support the CustomPage functionality (eg OrganizationProfile.Page)
// Also the `typeof BaseOrganizationProfile` is used to resolved the following error:
// "The inferred type of 'OrganizationProfile' cannot be named without a reference to ..."
export const OrganizationProfile: typeof BaseOrganizationProfile = Object.assign(
  (props: OrganizationProfileProps) => {
    const { pathname: path } = useLocation();
    return <BaseOrganizationProfile {...useRoutingProps('OrganizationProfile', props, { path })} />;
  },
  { ...BaseOrganizationProfile },
);

export const SignIn = (props: SignInProps) => {
  const { pathname: path } = useLocation();
  return <BaseSignIn {...useRoutingProps('SignIn', props, { path })} />;
};

export const SignUp = (props: SignUpProps) => {
  const { pathname: path } = useLocation();
  return <BaseSignUp {...useRoutingProps('SignUp', props, { path })} />;
};
