import type { AlternativePhoneCodeStrategy } from '@clerk/types';

import { useCoreSignUp } from '../../contexts';
import type { LocalizationKey } from '../../customizables';
import { Flow, localizationKeys } from '../../customizables';
import { useCardState, withCardStateProvider } from '../../elements';
import { useFetch } from '../../hooks';
import { handleError } from '../../utils';
import { SignUpVerificationCodeForm } from './SignUpVerificationCodeForm';

type SignUpPhoneCodeCardProps = {
  phoneCodeStrategy?: AlternativePhoneCodeStrategy;
  cardTitle?: LocalizationKey;
  cardSubtitle?: LocalizationKey;
  resendButton?: LocalizationKey;
};

export const SignUpPhoneCodeCard = withCardStateProvider(
  ({ phoneCodeStrategy, cardTitle, cardSubtitle, resendButton }: SignUpPhoneCodeCardProps) => {
    const signUp = useCoreSignUp();
    const card = useCardState();
    const strategy = phoneCodeStrategy ?? 'phone_code';

    const phoneVerificationStatus = signUp.verifications.phoneNumber.status;
    const shouldAvoidPrepare = !signUp.status || phoneVerificationStatus === 'verified';
    const prepare = () => {
      if (shouldAvoidPrepare) {
        return;
      }
      return signUp.preparePhoneNumberVerification({ strategy }).catch(err => handleError(err, [], card.setError));
    };

    // TODO: Introduce a useMutation to handle mutating requests
    useFetch(
      shouldAvoidPrepare
        ? undefined
        : () => signUp.preparePhoneNumberVerification({ strategy }).catch(err => handleError(err, [], card.setError)),
      {
        name: 'signUp.preparePhoneNumberVerification',
        strategy,
        number: signUp.phoneNumber,
      },
      {
        staleTime: 100,
      },
    );

    const attempt = (code: string) => signUp.attemptPhoneNumberVerification({ code, strategy });

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
        />
      </Flow.Part>
    );
  },
);
