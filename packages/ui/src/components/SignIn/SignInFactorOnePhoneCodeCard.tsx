import type { PhoneCodeFactor } from '@clerk/shared/types';

import { Flow, localizationKeys } from '../../customizables';
import type { SignInFactorOneCodeCard } from './SignInFactorOneCodeForm';
import { SignInFactorOneCodeForm } from './SignInFactorOneCodeForm';

type SignInFactorOnePhoneCodeCardProps = SignInFactorOneCodeCard & { factor: PhoneCodeFactor };

export const SignInFactorOnePhoneCodeCard = (props: SignInFactorOnePhoneCodeCardProps) => {
  return (
    <Flow.Part part='phoneCode'>
      <SignInFactorOneCodeForm
        {...props}
        cardTitle={localizationKeys('signIn.phoneCode.title')}
        cardSubtitle={localizationKeys('signIn.phoneCode.subtitle')}
        inputLabel={localizationKeys('signIn.phoneCode.formTitle')}
        resendButton={localizationKeys('signIn.phoneCode.resendButton')}
      />
    </Flow.Part>
  );
};
