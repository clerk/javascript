import React from 'react';

import { useCoreSignUp } from '../../contexts';
import { Flow, localizationKeys } from '../../customizables';
import { SignUpVerificationCodeForm } from './SignUpVerificationCodeForm';

export const SignUpEmailCodeCard = () => {
  const signUp = useCoreSignUp();

  React.useEffect(() => {
    // TODO: This prepare method is not idempotent.
    // We need to make sure that R18 won't trigger this twice
    void prepare();
  }, []);

  const prepare = () => {
    const emailVerificationStatus = signUp.verifications.emailAddress.status;
    if (!signUp.status || emailVerificationStatus === 'verified') {
      return;
    }
    return signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
  };

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
