import React from 'react';

import { useCoreSignUp } from '../../contexts';
import { Flow, localizationKeys } from '../../customizables';
import { withCardStateProvider } from '../../elements';
import { SignUpVerificationCodeForm } from './SignUpVerificationCodeForm';

export const SignUpPhoneCodeCard = withCardStateProvider(() => {
  const signUp = useCoreSignUp();

  React.useEffect(() => {
    // TODO: This prepare method is not idempotent.
    // We need to make sure that R18 won't trigger this twice
    void prepare();
  }, []);

  const prepare = () => {
    const phoneVerificationStatus = signUp.verifications.phoneNumber.status;
    if (!signUp.status || phoneVerificationStatus === 'verified') {
      return;
    }
    return signUp.preparePhoneNumberVerification({ strategy: 'phone_code' });
  };

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
