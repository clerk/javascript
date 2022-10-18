import { TOTPFactor } from '@clerk/types';
import React from 'react';

import { Flow, localizationKeys } from '../../customizables';
import { SignInFactorTwoCodeCard, SignInFactorTwoCodeForm } from './SignInFactorTwoCodeForm';

type SignInFactorTwoTOTPCardProps = SignInFactorTwoCodeCard & { factor: TOTPFactor };

export const SignInFactorTwoTOTPCard = (props: SignInFactorTwoTOTPCardProps) => {
  return (
    <Flow.Part part='totp2Fa'>
      <SignInFactorTwoCodeForm
        {...props}
        cardTitle={localizationKeys('signIn.totpMfa.title')}
        cardSubtitle={localizationKeys('signIn.totpMfa.subtitle')}
        formTitle={localizationKeys('signIn.totpMfa.formTitle')}
        formSubtitle={localizationKeys('signIn.totpMfa.formSubtitle')}
      />
    </Flow.Part>
  );
};
