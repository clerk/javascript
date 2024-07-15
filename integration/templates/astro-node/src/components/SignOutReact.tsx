import { useAuth } from '@clerk/astro/react';
import React from 'react';
import { type PropsWithChildren } from 'react';

export function SignOutReact(props: PropsWithChildren) {
  const { isSignedIn, signOut, getToken } = useAuth();

  if (!isSignedIn) {
    return null;
  }
  return (
    <button
      className='text-white'
      onClick={() => signOut()}
    >
      {props.children}
    </button>
  );
}
