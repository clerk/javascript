'use client';
import { SignIn as OgSignIn, SignUp as OgSignUp, UserButton as OgUserButton, UserProfile } from '@clerk/clerk-react';
import { SignInProps, SignUpProps, UserButtonProps } from '@clerk/types';
import { usePathname, useSearchParams } from 'next/navigation';
import React from 'react';

export const UserButton = (props: UserButtonProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  return (
    <OgUserButton
      afterSignOutUrl={props.afterSignOutUrl || `${pathname}${searchParams.toString()}`}
      {...props}
    />
  );
};

export const SignIn = (props: SignInProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  return (
    <OgSignIn
      redirectUrl={props.redirectUrl || `${pathname}${searchParams.toString()}`}
      {...props}
    />
  );
};

export const SignUp = (props: SignUpProps) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  return (
    <OgSignUp
      redirectUrl={props.redirectUrl || `${pathname}${searchParams.toString()}`}
      {...props}
    />
  );
};

export { UserProfile };
