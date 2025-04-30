import type { AlternativePhoneCodeStrategy } from '@clerk/types';

import { useCoreSignUp } from '../../contexts';
import { Flow, localizationKeys } from '../../customizables';
import { useCardState, withCardStateProvider } from '../../elements';
import { useFetch } from '../../hooks';
import { handleError } from '../../utils';
import { SignUpVerificationCodeForm } from './SignUpVerificationCodeForm';

type SignUpPhoneCodeCardProps = {
  phoneCodeStrategy?: AlternativePhoneCodeStrategy;
};

export const SignUpPhoneCodeCard = withCardStateProvider(({ phoneCodeStrategy }: SignUpPhoneCodeCardProps) => {
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

  const attempt = (code: string) => signUp.attemptPhoneNumberVerification({ code });

  return (
    <Flow.Part part='phoneCode'>
      <SignUpVerificationCodeForm
        cardTitle={localizationKeys('signUp.phoneCode.title')}
        cardSubtitle={localizationKeys('signUp.phoneCode.subtitle')}
        resendButton={localizationKeys('signUp.phoneCode.resendButton')}
        prepare={prepare}
        attempt={attempt}
        safeIdentifier={signUp.phoneNumber}
      />
    </Flow.Part>
  );
});
