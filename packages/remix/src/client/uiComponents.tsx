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

import { useClerkRemixOptions } from './RemixOptionsContext';

export const UserProfile = withPathDefaultRouting(BaseUserProfile);
export const CreateOrganization = withPathDefaultRouting(BaseCreateOrganization);
export const OrganizationProfile = withPathDefaultRouting(BaseOrganizationProfile);

export const SignIn = (props: SignInProps) => {
  const { signInUrl } = useClerkRemixOptions();
  const path = props.path || signInUrl;

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
