import { PhoneCodeFactor } from '@clerk/types';
import React from 'react';

import { useCoreSignIn } from '../../contexts';
import { Flow, localizationKeys } from '../../customizables';
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
        cardTitle={localizationKeys('signIn.phoneCode2Fa.title')}
        cardSubtitle={localizationKeys('signIn.phoneCode2Fa.subtitle')}
        formTitle={localizationKeys('signIn.phoneCode2Fa.formTitle')}
        formSubtitle={localizationKeys('signIn.phoneCode2Fa.formSubtitle')}
        resendButton={localizationKeys('signIn.phoneCode2Fa.resendButton')}
        prepare={prepare}
      />
    </Flow.Part>
  );
};
