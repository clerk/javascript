import { getAlternativePhoneCodeProviderByStrategy } from '@clerk/shared/alternativePhoneCode';
import type { AlternativePhoneCodeStrategy } from '@clerk/types';

import { localizationKeys } from '../../localization';
import { SignUpPhoneCodeCard } from './SignUpPhoneCodeCard';

type SignUpVerifyPhoneWithAlternativeProviderProps = {
  phoneCodeStrategy: AlternativePhoneCodeStrategy;
};

export const SignUpVerifyPhoneWithAlternativeProvider = ({
  phoneCodeStrategy,
}: SignUpVerifyPhoneWithAlternativeProviderProps) => {
  const providerName = getAlternativePhoneCodeProviderByStrategy(phoneCodeStrategy)?.name;
  const cardTitle = localizationKeys('signUp.alternativePhoneCodeProvider.title', { provider: providerName });
  const cardSubtitle = localizationKeys('signUp.alternativePhoneCodeProvider.subtitle', { provider: providerName });
  const resendButton = localizationKeys('signUp.alternativePhoneCodeProvider.resendButton');
  return (
    <SignUpPhoneCodeCard
      phoneCodeStrategy={phoneCodeStrategy}
      cardTitle={cardTitle}
      cardSubtitle={cardSubtitle}
      resendButton={resendButton}
    />
  );
};
