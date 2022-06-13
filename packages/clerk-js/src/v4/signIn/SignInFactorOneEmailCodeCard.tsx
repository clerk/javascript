import { EmailCodeFactor } from '@clerk/types';
import React from 'react';

import { useEnvironment } from '../../ui/contexts';
import { withFlowCardContext } from '../elements';
import { SignInFactorOneCodeCard, SignInFactorOneCodeForm } from './SignInFactorOneCodeForm';

type SignInFactorOneEmailCodeCardProps = SignInFactorOneCodeCard & { factor: EmailCodeFactor };

export const SignInFactorOneEmailCodeCard = withFlowCardContext(
  (props: SignInFactorOneEmailCodeCardProps) => {
    const { applicationName } = useEnvironment().displayConfig;

    return (
      <SignInFactorOneCodeForm
        {...props}
        cardTitle='Sign in'
        cardSubtitle={`To continue to ${applicationName}`}
        formTitle='Verification code'
        formSubtitle='Enter the verification code sent to your email address'
      />
    );
  },
  { flow: 'signIn', page: 'emailCode' },
);
