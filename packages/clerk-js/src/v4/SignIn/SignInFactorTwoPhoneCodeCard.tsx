import { PhoneCodeFactor } from '@clerk/types';
import React from 'react';

import { useCoreSignIn } from '../../ui/contexts';
import { Flow } from '../customizables';
import { SignInFactorTwoCodeCard, SignInFactorTwoCodeForm } from './SignInFactorTwoCodeForm';

type SignInFactorTwoPhoneCodeCardProps = SignInFactorTwoCodeCard & { factor: PhoneCodeFactor };

export const SignInFactorTwoPhoneCodeCard = (props: SignInFactorTwoPhoneCodeCardProps) => {
  const signIn = useCoreSignIn();

  const prepare = () => {
    // TODO: Why does the BE throw an error if I simply pass
    // the whole factor?
    const { phoneNumberId, strategy } = props.factor;
    return signIn.prepareSecondFactor({ phoneNumberId, strategy });
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
