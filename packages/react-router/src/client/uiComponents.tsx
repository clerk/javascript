import {
  OrganizationProfile as BaseOrganizationProfile,
  SignIn as BaseSignIn,
  SignUp as BaseSignUp,
  UserProfile as BaseUserProfile,
} from '@clerk/react';
import { useRoutingProps } from '@clerk/react/internal';
import type { OrganizationProfileProps, SignInProps, SignUpProps, UserProfileProps } from '@clerk/shared/types';
import React from 'react';

import { usePathnameWithoutSplatRouteParams } from './usePathnameWithoutSplatRouteParams';

// The assignment of UserProfile with BaseUserProfile props is used
// to support the CustomPage functionality (eg UserProfile.Page)
// Also the `typeof BaseUserProfile` is used to resolved the following error:
// "The inferred type of 'UserProfile' cannot be named without a reference to ..."
export const UserProfile: typeof BaseUserProfile = Object.assign(
  (props: UserProfileProps) => {
    const path = usePathnameWithoutSplatRouteParams();
    return <BaseUserProfile {...useRoutingProps('UserProfile', props, { path })} />;
  },
  { ...BaseUserProfile },
);

// The assignment of OrganizationProfile with BaseOrganizationProfile props is used
// to support the CustomPage functionality (eg OrganizationProfile.Page)
// Also the `typeof BaseOrganizationProfile` is used to resolved the following error:
// "The inferred type of 'OrganizationProfile' cannot be named without a reference to ..."
export const OrganizationProfile: typeof BaseOrganizationProfile = Object.assign(
  (props: OrganizationProfileProps) => {
    const path = usePathnameWithoutSplatRouteParams();
    return <BaseOrganizationProfile {...useRoutingProps('OrganizationProfile', props, { path })} />;
  },
  { ...BaseOrganizationProfile },
);

export const SignIn = (props: SignInProps) => {
  const path = usePathnameWithoutSplatRouteParams();
  return <BaseSignIn {...useRoutingProps('SignIn', props, { path })} />;
};

export const SignUp = (props: SignUpProps) => {
  const path = usePathnameWithoutSplatRouteParams();
  return <BaseSignUp {...useRoutingProps('SignUp', props, { path })} />;
};
