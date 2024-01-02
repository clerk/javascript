import { useCoreSignUp } from '../../contexts';
import { Flow, localizationKeys } from '../../customizables';
import { useFetch } from '../../hooks';
import { SignUpVerificationCodeForm } from './SignUpVerificationCodeForm';

export const SignUpEmailCodeCard = () => {
  const signUp = useCoreSignUp();

  const prepare = () => {
    const emailVerificationStatus = signUp.verifications.emailAddress.status;
    if (!signUp.status || emailVerificationStatus === 'verified') {
      return;
    }
    return signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
  };

  // TODO: Introduce a useMutation to handle mutating requests
  useFetch(
    // @ts-ignore Typescript complains because prepare may return undefined
    prepare,
    {
      name: 'prepare',
      strategy: 'email_code',
      number: signUp.emailAddress,
    },
    {
      staleTime: 100,
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
