import React from 'react';
import { Link } from 'ui/router';
import { useSignUpContext } from 'ui/contexts';

export function SignInLink(): JSX.Element {
  const { signInUrl } = useSignUpContext();
  return (
    <div className='cl-auth-form-switch cl-auth-form-link'>
      <span className='cl-auth-form-link-label'>Already have an account?</span>{' '}
      <Link to={signInUrl}>Sign in</Link>
    </div>
  );
}
