import { PhoneCodeFactor } from '@clerk/types';
import React from 'react';

import { withFlowCardContext } from '../elements';
import { SignInFactorOneCodeCard, SignInFactorOneCodeForm } from './SignInFactorOneCodeForm';

type SignInFactorOnePhoneCodeCardProps = SignInFactorOneCodeCard & { factor: PhoneCodeFactor };

export const SignInFactorOnePhoneCodeCard = withFlowCardContext(
  (props: SignInFactorOnePhoneCodeCardProps) => {
    return (
      <SignInFactorOneCodeForm
        {...props}
        codeFormTitle='Verification code'
        codeFormSubtitle='Enter the verification code sent to your phone number'
      />
    );
  },
  { flow: 'signIn', page: 'emailCode' },
);
