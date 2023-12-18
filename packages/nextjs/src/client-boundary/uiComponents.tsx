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

export const UserProfile = (props: UserProfileProps) => {
  return <BaseUserProfile {...useRoutingProps(BaseUserProfile.displayName, props)} />;
};

export const CreateOrganization = (props: CreateOrganizationProps) => {
  return <BaseCreateOrganization {...useRoutingProps(BaseCreateOrganization.displayName, props)} />;
};

export const OrganizationProfile = (props: OrganizationProfileProps) => {
  return <BaseOrganizationProfile {...useRoutingProps(BaseOrganizationProfile.displayName, props)} />;
};

export const SignIn = (props: SignInProps) => {
  const { signInUrl } = useClerkNextOptions();
  return <BaseSignIn {...useRoutingProps(BaseSignIn.displayName, props, { path: signInUrl })} />;
};

export const SignUp = (props: SignUpProps) => {
  const { signUpUrl } = useClerkNextOptions();
  return <BaseSignUp {...useRoutingProps(BaseSignUp.displayName, props, { path: signUpUrl })} />;
};
