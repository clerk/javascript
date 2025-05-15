import { getAlternativePhoneCodeProviderData } from '@clerk/shared/alternativePhoneCode';
import type { PhoneCodeFactor } from '@clerk/types';

import { Flow, localizationKeys } from '../../customizables';
import type { SignInFactorOneCodeCard } from './SignInFactorOneCodeForm';
import { SignInFactorOneCodeForm } from './SignInFactorOneCodeForm';

type SignInFactorOnePhoneCodeCardProps = SignInFactorOneCodeCard & { factor: PhoneCodeFactor };

export const SignInFactorOnePhoneCodeCard = (props: SignInFactorOnePhoneCodeCardProps) => {
  const { factor } = props;
  const { channel } = factor;

  let cardTitle = localizationKeys('signIn.phoneCode.title');
  let cardSubtitle = localizationKeys('signIn.phoneCode.subtitle');
  let inputLabel = localizationKeys('signIn.phoneCode.formTitle');
  let resendButton = localizationKeys('signIn.phoneCode.resendButton');
  if (channel && channel !== 'sms') {
    cardTitle = localizationKeys('signIn.alternativePhoneCodeProvider.title', {
      provider: getAlternativePhoneCodeProviderData(channel)?.name,
    });
    cardSubtitle = localizationKeys('signIn.alternativePhoneCodeProvider.subtitle');
    inputLabel = localizationKeys('signIn.alternativePhoneCodeProvider.formTitle');
    resendButton = localizationKeys('signIn.alternativePhoneCodeProvider.resendButton');
  }

  return (
    <Flow.Part part='phoneCode'>
      <SignInFactorOneCodeForm
        {...props}
        cardTitle={cardTitle}
        cardSubtitle={cardSubtitle}
        inputLabel={inputLabel}
        resendButton={resendButton}
      />
    </Flow.Part>
  );
};
