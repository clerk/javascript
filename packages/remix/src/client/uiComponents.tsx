import { SignIn as BaseSignIn, SignUp as BaseSignUp } from '@clerk/clerk-react';
import type { SignInProps, SignUpProps } from '@clerk/types';
import React from 'react';

import { useClerkRemixOptions } from './RemixOptionsContext';

export const SignIn = (props: SignInProps) => {
  const { signInUrl } = useClerkRemixOptions();
  if (signInUrl) {
    return (
      <BaseSignIn
        routing='path'
        path={signInUrl}
        {...props}
      />
    );
  }
  return <BaseSignIn {...props} />;
};

export const SignUp = (props: SignUpProps) => {
  const { signUpUrl } = useClerkRemixOptions();
  if (signUpUrl) {
    return (
      <BaseSignUp
        routing='path'
        path={signUpUrl}
        {...props}
      />
    );
  }
  return <BaseSignUp {...props} />;
};
