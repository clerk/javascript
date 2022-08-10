import React from 'react';

import { useCoreSignUp, useEnvironment } from '../../ui/contexts';
import { Flow } from '../customizables';
import { SignUpVerificationCodeForm } from './SignUpVerificationCodeForm';

export const SignUpEmailCodeCard = () => {
  const { displayConfig } = useEnvironment();
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
        cardTitle='Verify your email'
        cardSubtitle={`to continue to ${displayConfig.applicationName}`}
        formTitle='Verification code'
        formSubtitle='Enter the verification code sent to your email address'
        prepare={prepare}
        attempt={attempt}
        safeIdentifier={signUp.emailAddress}
      />
    </Flow.Part>
  );
};
