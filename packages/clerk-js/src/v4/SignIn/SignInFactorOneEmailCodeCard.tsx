import { EmailCodeFactor } from '@clerk/types';
import React from 'react';

import { useEnvironment } from '../../ui/contexts';
import { Flow } from '../customizables';
import { SignInFactorOneCodeCard, SignInFactorOneCodeForm } from './SignInFactorOneCodeForm';

type SignInFactorOneEmailCodeCardProps = SignInFactorOneCodeCard & { factor: EmailCodeFactor };

export const SignInFactorOneEmailCodeCard = (props: SignInFactorOneEmailCodeCardProps) => {
  const { applicationName } = useEnvironment().displayConfig;

  return (
    <Flow.Part part='emailCode'>
      <SignInFactorOneCodeForm
        {...props}
        cardTitle='Enter verification code'
        cardSubtitle={`To continue to ${applicationName}`}
        formTitle='Verification code'
        formSubtitle='Enter the verification code sent to your email address'
      />
    </Flow.Part>
  );
};
