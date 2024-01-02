import { useCoreSignUp } from '../../contexts';
import { Flow, localizationKeys } from '../../customizables';
import { withCardStateProvider } from '../../elements';
import { useFetch } from '../../hooks';
import { SignUpVerificationCodeForm } from './SignUpVerificationCodeForm';

export const SignUpPhoneCodeCard = withCardStateProvider(() => {
  const signUp = useCoreSignUp();

  const prepare = () => {
    const phoneVerificationStatus = signUp.verifications.phoneNumber.status;
    if (!signUp.status || phoneVerificationStatus === 'verified') {
      return;
    }
    return signUp.preparePhoneNumberVerification({ strategy: 'phone_code' });
  };

  // TODO: Introduce a useMutation to handle mutating requests
  useFetch(
    // @ts-ignore Typescript complains because prepare may return undefined
    prepare,
    {
      name: 'prepare',
      strategy: 'phone_code',
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
        formTitle={localizationKeys('signUp.phoneCode.formTitle')}
        formSubtitle={localizationKeys('signUp.phoneCode.formSubtitle')}
        resendButton={localizationKeys('signUp.phoneCode.resendButton')}
        prepare={prepare}
        attempt={attempt}
        safeIdentifier={signUp.phoneNumber}
      />
    </Flow.Part>
  );
});
