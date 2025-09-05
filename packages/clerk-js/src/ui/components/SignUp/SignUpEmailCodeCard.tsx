import { useCardState } from '@/ui/elements/contexts';
import { handleError } from '@/ui/utils/errorHandler';

import { useCoreSignUp } from '../../contexts';
import { Flow, localizationKeys } from '../../customizables';
import { useFetch } from '../../hooks';
import { SignUpVerificationCodeForm } from './SignUpVerificationCodeForm';

export const SignUpEmailCodeCard = () => {
  const signUp = useCoreSignUp();
  const card = useCardState();

  const emailVerificationStatus = signUp.verifications.emailAddress.status;
  const shouldAvoidPrepare = !signUp.status || emailVerificationStatus === 'verified';

  const prepare = () => {
    if (shouldAvoidPrepare) {
      return;
    }
    return signUp
      .prepareEmailAddressVerification({ strategy: 'email_code' })
      .catch(err => handleError(err, [], card.setError));
  };

  // TODO: Introduce a useMutation to handle mutating requests
  useFetch(
    shouldAvoidPrepare ? undefined : () => signUp.prepareEmailAddressVerification({ strategy: 'email_code' }),
    {
      name: 'prepare',
      strategy: 'email_code',
      number: signUp.emailAddress,
    },
    {
      staleTime: 100,
      onError: err => handleError(err, [], card.setError),
    },
  );

  const attempt = (code: string) => signUp.attemptEmailAddressVerification({ code });

  return (
    <Flow.Part part='emailCode'>
      <SignUpVerificationCodeForm
        cardTitle={localizationKeys('signUp.emailCode.title')}
        cardSubtitle={localizationKeys('signUp.emailCode.subtitle')}
        inputLabel={localizationKeys('signUp.emailCode.formSubtitle')}
        resendButton={localizationKeys('signUp.emailCode.resendButton')}
        prepare={prepare}
        attempt={attempt}
        safeIdentifier={signUp.emailAddress}
      />
    </Flow.Part>
  );
};
