import { PhoneCodeFactor } from '@clerk/types';
import React from 'react';

import { useEnvironment } from '../../ui/contexts';
import { Flow } from '../customizables';
import { SignInFactorOneCodeCard, SignInFactorOneCodeForm } from './SignInFactorOneCodeForm';

type SignInFactorOnePhoneCodeCardProps = SignInFactorOneCodeCard & { factor: PhoneCodeFactor };

export const SignInFactorOnePhoneCodeCard = (props: SignInFactorOnePhoneCodeCardProps) => {
  const { applicationName } = useEnvironment().displayConfig;

  return (
    <Flow.Part part='phoneCode'>
      <SignInFactorOneCodeForm
        {...props}
        cardTitle='Check your phone'
        cardSubtitle={`To continue to ${applicationName}`}
        formTitle='Verification code'
        formSubtitle='Enter the verification code sent to your phone number'
      />
    </Flow.Part>
  );
};
