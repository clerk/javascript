import { getAlternativePhoneCodeProviderData } from '@clerk/shared/alternativePhoneCode';

import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { LoadingCard } from '@/ui/elements/LoadingCard';
import { handleError } from '@/ui/utils/errorHandler';

import { useCoreSignUp } from '../../contexts';
import { Flow, localizationKeys } from '../../customizables';
import { useFetch } from '../../hooks';
import { SignUpVerificationCodeForm } from './SignUpVerificationCodeForm';

export const SignUpPhoneCodeCard = withCardStateProvider(() => {
  const signUp = useCoreSignUp();
  const card = useCardState();
  const channel = signUp.verifications.phoneNumber.channel;

  const phoneVerificationStatus = signUp.verifications.phoneNumber.status;
  const shouldAvoidPrepare = !signUp.status || phoneVerificationStatus === 'verified';
  const isAlternativePhoneCodeProvider = !!channel && channel !== 'sms';

  // If the channel is 'sms', we don't want to send the channel parameter
  const channelToBeSent = isAlternativePhoneCodeProvider ? channel : undefined;

  const prepare = () => {
    if (shouldAvoidPrepare) {
      return;
    }
    return signUp
      .preparePhoneNumberVerification({ strategy: 'phone_code', channel: channelToBeSent })
      .catch(err => handleError(err, [], card.setError));
  };

  // TODO: Introduce a useMutation to handle mutating requests
  useFetch(
    // If an alternative phone code provider is used, we skip the prepare step
    // because the verification is already created on the Start screen
    shouldAvoidPrepare || isAlternativePhoneCodeProvider
      ? undefined
      : () => signUp.preparePhoneNumberVerification({ strategy: 'phone_code', channel: undefined }),
    {
      name: 'signUp.preparePhoneNumberVerification',
      strategy: 'phone_code',
      number: signUp.phoneNumber,
    },
    {
      staleTime: 100,
      onError: err => handleError(err, [], card.setError),
    },
  );

  const attempt = (code: string) => signUp.attemptPhoneNumberVerification({ code });

  let cardTitleKey = localizationKeys('signUp.phoneCode.title');
  let cardSubtitleKey = localizationKeys('signUp.phoneCode.subtitle');
  let resendButtonKey = localizationKeys('signUp.phoneCode.resendButton');

  if (isAlternativePhoneCodeProvider) {
    const provider = getAlternativePhoneCodeProviderData(channel)?.name;
    cardTitleKey = localizationKeys('signUp.alternativePhoneCodeProvider.title', { provider: provider || '' });
    cardSubtitleKey = localizationKeys('signUp.alternativePhoneCodeProvider.subtitle', {
      provider: provider || '',
    });
    resendButtonKey = localizationKeys('signUp.alternativePhoneCodeProvider.resendButton');
  }

  const prepareWithSMS = () => {
    card.setLoading();
    card.setError(undefined);
    void signUp
      .preparePhoneNumberVerification({ strategy: 'phone_code', channel: undefined })
      .catch(err => handleError(err, [], card.setError))
      .finally(() => card.setIdle());
  };

  if (card.isLoading) {
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
