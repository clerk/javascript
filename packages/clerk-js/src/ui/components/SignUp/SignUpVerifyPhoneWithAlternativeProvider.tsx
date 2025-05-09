import { getAlternativePhoneCodeProviderData } from '@clerk/shared/alternativePhoneCode';
import type { PhoneCodeChannel } from '@clerk/types';

import { localizationKeys } from '../../localization';
import { SignUpPhoneCodeCard } from './SignUpPhoneCodeCard';

type SignUpVerifyPhoneWithAlternativeProviderProps = {
  phoneCodeChannel: PhoneCodeChannel;
};

export const SignUpVerifyPhoneWithAlternativeProvider = ({
  phoneCodeChannel,
}: SignUpVerifyPhoneWithAlternativeProviderProps) => {
  const providerName = getAlternativePhoneCodeProviderData(phoneCodeChannel)?.name;
  const cardTitle = localizationKeys('signUp.alternativePhoneCodeProvider.title', { provider: providerName });
  const cardSubtitle = localizationKeys('signUp.alternativePhoneCodeProvider.subtitle', { provider: providerName });
  const resendButton = localizationKeys('signUp.alternativePhoneCodeProvider.resendButton');
  return (
    <SignUpPhoneCodeCard
      phoneCodeChannel={phoneCodeChannel}
      cardTitle={cardTitle}
      cardSubtitle={cardSubtitle}
      resendButton={resendButton}
    />
  );
};
