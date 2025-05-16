import { getAlternativePhoneCodeProviderData } from '@clerk/shared/alternativePhoneCode';
import { useState } from 'react';

import { useCoreSignUp } from '../../contexts';
import { Flow, localizationKeys } from '../../customizables';
import { LoadingCard, useCardState, withCardStateProvider } from '../../elements';
import { useFetch } from '../../hooks';
import { handleError } from '../../utils';
import { SignUpVerificationCodeForm } from './SignUpVerificationCodeForm';

export const SignUpPhoneCodeCard = withCardStateProvider(() => {
  const signUp = useCoreSignUp();
  const card = useCardState();
  const [isLoading, setIsLoading] = useState(false);
  const [userSelectedFallbackToSMS, setUserSelectedFallbackToSMS] = useState(false);
  const channel = signUp.verifications.phoneNumber.channel;

  const phoneVerificationStatus = signUp.verifications.phoneNumber.status;
  const shouldAvoidPrepare = !signUp.status || phoneVerificationStatus === 'verified';
  const isAlternativePhoneCodeProvider = !!channel && channel !== 'sms';

  const prepare = () => {
    if (shouldAvoidPrepare) {
      return;
    }
    return signUp
      .preparePhoneNumberVerification({ strategy: 'phone_code', channel })
      .catch(err => handleError(err, [], card.setError));
  };

  // TODO: Introduce a useMutation to handle mutating requests
  useFetch(
    // If an alternative phone code provider is used, we skip the prepare step
    // because the verification is already created on the Start screen
    shouldAvoidPrepare || isAlternativePhoneCodeProvider || userSelectedFallbackToSMS
      ? undefined
      : () =>
          signUp
            .preparePhoneNumberVerification({ strategy: 'phone_code', channel })
            .catch(err => handleError(err, [], card.setError)),
    {
      name: 'signUp.preparePhoneNumberVerification',
      strategy: 'phone_code',
      number: signUp.phoneNumber,
    },
    {
      staleTime: 100,
    },
  );

  const attempt = (code: string) => signUp.attemptPhoneNumberVerification({ code });

  let cardTitleKey = localizationKeys('signUp.phoneCode.title');
  let cardSubtitleKey = localizationKeys('signUp.phoneCode.subtitle');
  let resendButtonKey = localizationKeys('signUp.phoneCode.resendButton');

  if (isAlternativePhoneCodeProvider) {
    const provider = getAlternativePhoneCodeProviderData(channel)?.name;
    cardTitleKey = localizationKeys('signUp.alternativePhoneCodeProvider.title', { provider });
    cardSubtitleKey = localizationKeys('signUp.alternativePhoneCodeProvider.subtitle', { provider });
    resendButtonKey = localizationKeys('signUp.alternativePhoneCodeProvider.resendButton');
  }

  const prepareWithSMS = () => {
    setIsLoading(true);
    card.setError(undefined);
    void signUp
      .preparePhoneNumberVerification({ strategy: 'phone_code', channel: 'sms' })
      .then(() => setUserSelectedFallbackToSMS(true))
      .catch(err => handleError(err, [], card.setError))
      .finally(() => setIsLoading(false));
  };

  if (isLoading) {
    return <LoadingCard />;
  }

  return (
    <Flow.Part part='phoneCode'>
      <SignUpVerificationCodeForm
        cardTitle={cardTitleKey}
        cardSubtitle={cardSubtitleKey}
        resendButton={resendButtonKey}
        prepare={prepare}
        attempt={attempt}
        safeIdentifier={signUp.phoneNumber}
        alternativeMethodsLabel={
          isAlternativePhoneCodeProvider
            ? localizationKeys('footerActionLink__alternativePhoneCodeProvider')
            : undefined
        }
        onShowAlternativeMethodsClicked={isAlternativePhoneCodeProvider ? prepareWithSMS : undefined}
        showAlternativeMethods={isAlternativePhoneCodeProvider ? true : undefined}
      />
    </Flow.Part>
  );
});
