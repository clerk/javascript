import type { PhoneCodeChannel } from '@clerk/types';

import { useCoreSignUp } from '../../contexts';
import type { LocalizationKey } from '../../customizables';
import { Flow, localizationKeys } from '../../customizables';
import { useCardState, withCardStateProvider } from '../../elements';
import { useFetch } from '../../hooks';
import { handleError } from '../../utils';
import { SignUpVerificationCodeForm } from './SignUpVerificationCodeForm';

type SignUpPhoneCodeCardProps = {
  phoneCodeChannel?: PhoneCodeChannel;
  cardTitle?: LocalizationKey;
  cardSubtitle?: LocalizationKey;
  resendButton?: LocalizationKey;
};

export const SignUpPhoneCodeCard = withCardStateProvider(
  ({ phoneCodeChannel, cardTitle, cardSubtitle, resendButton }: SignUpPhoneCodeCardProps) => {
    const signUp = useCoreSignUp();
    const card = useCardState();
    const channel = phoneCodeChannel;

    const phoneVerificationStatus = signUp.verifications.phoneNumber.status;
    const shouldAvoidPrepare = !signUp.status || phoneVerificationStatus === 'verified';
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
      shouldAvoidPrepare
        ? undefined
        : () =>
            signUp
              .preparePhoneNumberVerification({ strategy: 'phone_code', channel })
              .catch(err => handleError(err, [], card.setError)),
      {
        name: 'signUp.preparePhoneNumberVerification',
        strategy: 'phone_code',
        number: signUp.phoneNumber,
        channel,
      },
      {
        staleTime: 100,
      },
    );

    const attempt = (code: string) => signUp.attemptPhoneNumberVerification({ code });

    const cardTitleKey = cardTitle ?? localizationKeys('signUp.phoneCode.title');
    const cardSubtitleKey = cardSubtitle ?? localizationKeys('signUp.phoneCode.subtitle');
    const resendButtonKey = resendButton ?? localizationKeys('signUp.phoneCode.resendButton');

    return (
      <Flow.Part part='phoneCode'>
        <SignUpVerificationCodeForm
          cardTitle={cardTitleKey}
          cardSubtitle={cardSubtitleKey}
          resendButton={resendButtonKey}
          prepare={prepare}
          attempt={attempt}
          safeIdentifier={signUp.phoneNumber}
          channel={channel}
        />
      </Flow.Part>
    );
  },
);
