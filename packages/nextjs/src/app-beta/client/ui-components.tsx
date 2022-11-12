'use client';
import {
  CreateOrganization,
  OrganizationProfile,
  OrganizationSwitcher,
  SignIn as OgSignIn,
  SignUp as OgSignUp,
  UserButton as OgUserButton,
  UserProfile,
} from '@clerk/clerk-react';
import { SignInProps, SignUpProps, UserButtonProps } from '@clerk/types';
import { usePathname, useSearchParams } from 'next/navigation';
import React from 'react';

const UserButton = (props: UserButtonProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  return (
    <OgUserButton
      afterSignOutUrl={props.afterSignOutUrl || `${pathname}${searchParams.toString()}`}
      {...props}
    />
  );
};

const SignIn = (props: SignInProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  return (
    <OgSignIn
      redirectUrl={props.redirectUrl || `${pathname}${searchParams.toString()}`}
      {...props}
    />
  );
};

const SignUp = (props: SignUpProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  return (
    <OgSignUp
      redirectUrl={props.redirectUrl || `${pathname}${searchParams.toString()}`}
      {...props}
    />
  );
};

export { SignIn, SignUp, UserButton, UserProfile, CreateOrganization, OrganizationProfile, OrganizationSwitcher };
