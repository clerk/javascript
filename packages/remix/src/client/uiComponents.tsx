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

import { errorThrower } from '../errorThrower';
import { useClerkRemixOptions } from './RemixOptionsContext';

export const UserProfile: typeof BaseUserProfile = withPathDefaultRouting(BaseUserProfile, 'UserProfile');
export const CreateOrganization: typeof BaseCreateOrganization = withPathDefaultRouting(
  BaseCreateOrganization,
  'CreateOrganization',
);
export const OrganizationProfile: typeof BaseOrganizationProfile = withPathDefaultRouting(BaseOrganizationProfile, '');

export const SignIn = (props: SignInProps) => {
  const { signInUrl } = useClerkRemixOptions();
  const path = props.path || signInUrl;
  if (!path && !props.routing) {
    errorThrower.throw('Missing path prop. <SignIn/> requires a path prop.');
  }

  if (path) {
    return (
      <BaseSignIn
        {...props}
        routing='path'
        path={path}
      />
    );
  }

  return <BaseSignIn {...props} />;
};

export const SignUp = (props: SignUpProps) => {
  const { signUpUrl } = useClerkRemixOptions();
  const path = props.path || signUpUrl;
  if (!path && !props.routing) {
    errorThrower.throw('Missing path prop. <SignUp/> requires a path prop.');
  }

  if (path) {
    return (
      <BaseSignUp
        routing='path'
        path={path}
      />
    );
  }
  return <BaseSignUp {...props} />;
};
