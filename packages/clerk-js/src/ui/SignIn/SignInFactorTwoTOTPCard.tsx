import { TOTPFactor } from '@clerk/types';
import React from 'react';

import { Flow, localizationKeys } from '../customizables';
import { SignInFactorTwoCodeCard, SignInFactorTwoCodeForm } from './SignInFactorTwoCodeForm';

type SignInFactorTwoTOTPCardProps = SignInFactorTwoCodeCard & { factor: TOTPFactor };

export const SignInFactorTwoTOTPCard = (props: SignInFactorTwoTOTPCardProps) => {
  return (
    <Flow.Part part='totp2Fa'>
      <SignInFactorTwoCodeForm
        {...props}
        cardTitle={localizationKeys('signIn.totp2Fa.title')}
        cardSubtitle={localizationKeys('signIn.totp2Fa.subtitle')}
        formTitle={localizationKeys('signIn.totp2Fa.formTitle')}
        formSubtitle={localizationKeys('signIn.totp2Fa.formSubtitle')}
        resendButton={localizationKeys('signIn.totp2Fa.resendButton')}
      />
    </Flow.Part>
  );
};
