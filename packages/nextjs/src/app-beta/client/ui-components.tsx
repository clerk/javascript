'use client';
import { SignIn as OgSignIn, SignUp as OgSignUp, UserButton as OgUserButton, UserProfile } from '@clerk/clerk-react';
import { usePathname, useSearchParams } from 'next/navigation';
import React from 'react';

export const UserButton = props => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  return (
    <OgUserButton
      afterSignOutUrl={props.afterSignOutUrl || `${pathname}${searchParams.toString()}`}
      {...props}
    />
  );
};

export const SignIn = props => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  return (
    <OgSignIn
      redirectUrl={props.redirectUrl || `${pathname}${searchParams.toString()}`}
      {...props}
    />
  );
};

export const SignUp = props => {
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
