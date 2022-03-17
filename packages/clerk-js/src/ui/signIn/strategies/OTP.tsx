import { Label } from '@clerk/shared/components/label';
import {
  OneTimeCodeInput,
  VerifyCodeHandler,
} from '@clerk/shared/components/oneTimeCodeInput';
import { SignInFactor } from '@clerk/types';
import React from 'react';
import { FieldState } from 'ui/common';
import { useCoreSignIn } from 'ui/contexts';

export type OTPProps = {
  code: FieldState<string>;
  verifyCode: VerifyCodeHandler;
  factor: SignInFactor;
};

export function OTP({
  factor,
  code,
  verifyCode,
}: OTPProps): JSX.Element | null {
  const signIn = useCoreSignIn();

  if (factor.strategy !== 'email_code' && factor.strategy !== 'phone_code') {
    return null;
  }

  // TODO: https://www.notion.so/clerkdev/c8719edf0d5041e0b4d263a7ee574b7c
  const handleResentClick = () => {
    signIn.prepareFirstFactor(factor);
  };

  return (
    <>
      <Label className='cl-auth-form-message'>
        Enter the 6-digit code sent to
        <br />
        <strong>{factor.safeIdentifier}</strong>
      </Label>
      <OneTimeCodeInput
        value={code.value}
        setValue={code.setValue}
        verifyCodeHandler={verifyCode}
        onResendCode={handleResentClick}
        className='cl-otp-input'
      />
    </>
  );
}
