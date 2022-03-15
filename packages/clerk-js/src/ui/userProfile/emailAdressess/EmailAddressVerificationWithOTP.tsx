import { OneTimeCodeInput, VerifyCodeHandler } from '@clerk/shared/components/oneTimeCodeInput';
import { noop } from '@clerk/shared/utils/noop';
import { EmailAddressResource } from '@clerk/types';
import React from 'react';
import { useFieldState, verificationErrorMessage } from 'ui/common';

type EmailAddressVerificationWithOTPProps = {
  email: EmailAddressResource;
  onVerificationComplete?: () => void;
  onError?: (err: any) => void;
  className?: string;
};

export function EmailAddressVerificationWithOTP({
  email,
  onError = noop,
  onVerificationComplete = noop,
  className,
}: EmailAddressVerificationWithOTPProps): JSX.Element {
  const code = useFieldState('code', '');

  React.useEffect(() => {
    void prepareVerification();
  }, []);

  const prepareVerification = () => {
    return email.prepareVerification({ strategy: 'email_code' }).catch(onError);
  };

  const verifyCode: VerifyCodeHandler = (verify, reject) => {
    email
      .attemptVerification({ code: code.value })
      .then(() => verify(onVerificationComplete))
      .catch(e => {
        reject(verificationErrorMessage(e));
      });
  };

  return (
    <div className={className}>
      <div className='cl-copy-text' style={{ marginBottom: '2em' }}>
        An email containing a verification code has been sent to{' '}
        <span className='cl-identifier'>{email.emailAddress}</span>.
      </div>
      <OneTimeCodeInput
        value={code.value}
        setValue={code.setValue}
        verifyCodeHandler={verifyCode}
        onResendCode={prepareVerification}
        className='cl-otp-input'
      />
    </div>
  );
}
