import { EmailCodeFactor } from '@clerk/types';
import React from 'react';

import { withFlowCardContext } from '../elements';
import { SignInFactorOneCodeCard, SignInFactorOneCodeForm } from './SignInFactorOneCodeForm';

type SignInFactorOneEmailCodeCardProps = SignInFactorOneCodeCard & { factor: EmailCodeFactor };

export const SignInFactorOneEmailCodeCard = withFlowCardContext(
  (props: SignInFactorOneEmailCodeCardProps) => {
    return (
      <SignInFactorOneCodeForm
        {...props}
        codeFormTitle='Verification code'
        codeFormSubtitle='Enter the verification code sent to your email address'
      />
    );
  },
  { flow: 'signIn', page: 'emailCode' },
);
