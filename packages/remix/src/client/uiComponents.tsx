import { SignIn as BaseSignIn, SignUp as BaseSignUp } from '@clerk/clerk-react';
import type { SignInProps, SignUpProps } from '@clerk/types';
import React from 'react';

import { useClerkRemixOptions } from './RemixOptionsContext';

export const SignIn = (props: SignInProps) => {
  const { signInUrl } = useClerkRemixOptions();
  const { routing: _routing, path, ...restProps } = props;

  if (signInUrl || path) {
    return (
      <BaseSignIn
        routing='path'
        path={path || signInUrl}
        {...restProps}
      />
    );
  }
  return <BaseSignIn {...props} />;
};

export const SignUp = (props: SignUpProps) => {
  const { signUpUrl } = useClerkRemixOptions();
  const { routing: _routing, path, ...restProps } = props;

  if (signUpUrl || path) {
    return (
      <BaseSignUp
        routing='path'
        path={path || signUpUrl}
        {...restProps}
      />
    );
  }
  return <BaseSignUp {...props} />;
};
