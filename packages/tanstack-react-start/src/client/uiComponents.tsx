import {
  OrganizationList as BaseOrganizationList,
  OrganizationProfile as BaseOrganizationProfile,
  SignIn as BaseSignIn,
  SignUp as BaseSignUp,
  UserProfile as BaseUserProfile,
} from '@clerk/react';
import { useRoutingProps } from '@clerk/react/internal';
import type { OrganizationProfileProps, SignInProps, SignUpProps, UserProfileProps } from '@clerk/shared/types';
import { useLocation, useParams } from '@tanstack/react-router';
import { useRef } from 'react';

const usePathnameWithoutSplatRouteParams = () => {
  const { _splat } = useParams({
    strict: false,
  });
  const { pathname } = useLocation();

  // Get the splat route params
  // TanStack Router uses _splat to represent the splat route params
  const splatRouteParam = _splat || '';

  // Remove the splat route param from the pathname
  // so we end up with the pathname where the components are mounted at
  // eg /user/123/profile/security will return /user/123/profile as the path
  const path = pathname.replace(splatRouteParam, '').replace(/\/$/, '').replace(/^\//, '').trim();

  const computedPath = `/${path}`;

  // Stabilize the base path to prevent race conditions during navigation away.
  // When TanStack Router navigates to a different route, useLocation() returns the
  // new pathname before this component unmounts. This causes the basePath to change,
  // which makes the SignIn/SignUp catch-all route fire RedirectToSignIn incorrectly.
  // Matches the pattern used in @clerk/nextjs usePathnameWithoutCatchAll.
  const stablePath = useRef(computedPath);
  return stablePath.current;
};

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

export const OrganizationList: typeof BaseOrganizationList = Object.assign(
  (props: OrganizationProfileProps) => {
    const path = usePathnameWithoutSplatRouteParams();
    return <BaseOrganizationList {...useRoutingProps('OrganizationList', props, { path })} />;
  },
  { ...BaseOrganizationList },
);

export const SignIn = (props: SignInProps) => {
  const path = usePathnameWithoutSplatRouteParams();
  return <BaseSignIn {...useRoutingProps('SignIn', props, { path })} />;
};

export const SignUp = (props: SignUpProps) => {
  const path = usePathnameWithoutSplatRouteParams();
  return <BaseSignUp {...useRoutingProps('SignUp', props, { path })} />;
};
