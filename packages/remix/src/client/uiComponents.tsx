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

import { useClerkRemixOptions } from './RemixOptionsContext';

export const UserProfile = (props: UserProfileProps) => {
  return <BaseUserProfile {...useRoutingProps('UserProfile', props)} />;
};

export const CreateOrganization = (props: CreateOrganizationProps) => {
  return <BaseCreateOrganization {...useRoutingProps('CreateOrganization', props)} />;
};

export const OrganizationProfile = (props: OrganizationProfileProps) => {
  return <BaseOrganizationProfile {...useRoutingProps('OrganizationProfile', props)} />;
};

export const SignIn = (props: SignInProps) => {
  const { signInUrl } = useClerkRemixOptions();
  return <BaseSignIn {...useRoutingProps('SignIn', props, { path: signInUrl })} />;
};

export const SignUp = (props: SignUpProps) => {
  const { signUpUrl } = useClerkRemixOptions();
  return <BaseSignUp {...useRoutingProps('SignUp', props, { path: signUpUrl })} />;
};
