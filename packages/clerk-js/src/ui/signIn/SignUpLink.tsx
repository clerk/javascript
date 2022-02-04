import React from 'react';
import { useSignInContext } from 'ui/contexts';
import { Link } from 'ui/router';

export function SignUpLink(): JSX.Element {
  const { signUpUrl } = useSignInContext();
  return (
    <div className='cl-auth-form-switch cl-auth-form-link'>
      <span className='cl-auth-form-link-label'>No account yet?</span>{' '}
      <Link to={signUpUrl}>Sign up</Link>
    </div>
  );
}
