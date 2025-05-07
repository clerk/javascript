import type { AlternativePhoneCodeFactor, PhoneCodeFactor } from '@clerk/types';

import type { LocalizationKey } from '../../customizables';
import { Flow } from '../../customizables';
import type { SignInFactorOneCodeCard } from './SignInFactorOneCodeForm';
import { SignInFactorOneCodeForm } from './SignInFactorOneCodeForm';

type SignInFactorOnePhoneCodeCardProps = SignInFactorOneCodeCard & {
  factor: PhoneCodeFactor | AlternativePhoneCodeFactor;
  cardTitle: LocalizationKey;
  cardSubtitle: LocalizationKey;
  inputLabel: LocalizationKey;
  resendButton: LocalizationKey;
};

export const SignInFactorOnePhoneCodeCard = (props: SignInFactorOnePhoneCodeCardProps) => {
  return (
    <Flow.Part part='phoneCode'>
      <SignInFactorOneCodeForm
        {...props}
        cardTitle={props.cardTitle}
        cardSubtitle={props.cardSubtitle}
        inputLabel={props.inputLabel}
        resendButton={props.resendButton}
      />
    </Flow.Part>
  );
};
