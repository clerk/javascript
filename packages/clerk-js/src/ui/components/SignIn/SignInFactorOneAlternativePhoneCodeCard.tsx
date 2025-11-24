import { getAlternativePhoneCodeProviderData } from '@clerk/shared/alternativePhoneCode';
import type { PhoneCodeFactor } from '@clerk/shared/types';

import { Flow, localizationKeys } from '../../customizables';
import type { SignInFactorOneAlternativeChannelCodeCard } from './SignInFactorOneAlternativeChannelCodeForm';
import { SignInFactorOneAlternativeChannelCodeForm } from './SignInFactorOneAlternativeChannelCodeForm';

type SignInFactorOneAlternativePhoneCodeCardProps = SignInFactorOneAlternativeChannelCodeCard & {
  factor: PhoneCodeFactor;
};

export const SignInFactorOneAlternativePhoneCodeCard = (props: SignInFactorOneAlternativePhoneCodeCardProps) => {
  return (
    <Flow.Part part='phoneCode'>
      <SignInFactorOneAlternativeChannelCodeForm
        {...props}
        cardTitle={localizationKeys('signIn.alternativePhoneCodeProvider.title', {
          provider: getAlternativePhoneCodeProviderData(props.factor.channel)?.name || '',
        })}
        cardSubtitle={localizationKeys('signIn.alternativePhoneCodeProvider.subtitle')}
        inputLabel={localizationKeys('signIn.alternativePhoneCodeProvider.formTitle')}
        resendButton={localizationKeys('signIn.alternativePhoneCodeProvider.resendButton')}
      />
    </Flow.Part>
  );
};
