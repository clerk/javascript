import { PhoneCodeFactor } from '@clerk/types';
import React from 'react';

import { useCoreSignIn } from '../../ui/contexts';
import { Flow } from '../customizables';
import { SignInFactorTwoCodeCard, SignInFactorTwoCodeForm } from './SignInFactorTwoCodeForm';

type SignInFactorTwoPhoneCodeCardProps = SignInFactorTwoCodeCard & { factor: PhoneCodeFactor };

export const SignInFactorTwoPhoneCodeCard = (props: SignInFactorTwoPhoneCodeCardProps) => {
  const signIn = useCoreSignIn();

  const prepare = () => {
    return signIn.prepareSecondFactor(props.factor);
  };

  return (
    <Flow.Part part='phoneCode2Fa'>
      <SignInFactorTwoCodeForm
        {...props}
        cardTitle='Two-step authentication'
        cardSubtitle={''}
        formTitle='Verification code'
        formSubtitle='Enter the verification code sent to your phone number'
        prepare={prepare}
      />
    </Flow.Part>
  );
};
