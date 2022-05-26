import { Label } from '@clerk/shared/components/label';
import { OneTimeCodeInput, VerifyCodeHandler } from '@clerk/shared/components/oneTimeCodeInput';
import { PhoneCodeFactor, SignInResource } from '@clerk/types';
import React from 'react';
import { Body, getGlobalError, handleError, Header, useFieldState, withRedirectToHome } from 'ui/common';
import { Alert } from 'ui/common/alert';
import { isVerificationExpiredError, VerificationErrorMessage } from 'ui/common/verification';
import { useCoreClerk, useCoreSignIn, useSignInContext } from 'ui/contexts';

import { determineSalutation } from './utils';

type SignInUiProps = Pick<SignInResource, 'userData' | 'identifier' | 'supportedSecondFactors' | 'status'>;

function _SignInFactorTwo(): JSX.Element {
  const { navigateAfterSignIn } = useSignInContext();
  const { setActive } = useCoreClerk();
  const signIn = useCoreSignIn();
  // after successful verification, the server returns a null SIA
  // so to avoid flickering before the navigation completes
  // we cache the ui props this components needs
  const cachedSignInRef = React.useRef<SignInUiProps>(signIn);
  const code = useFieldState('code', '');
  const [error, setError] = React.useState<string>();

  React.useEffect(() => {
    if (!signIn || !signIn.identifier) {
      return;
    }
    cachedSignInRef.current = signIn;
  }, [signIn]);

  React.useEffect(() => {
    if (!signIn.status) {
      return;
    }
    sendVerificationCode();
  }, []);

  const sendVerificationCode = () => {
    const status = signIn.secondFactorVerification.status;
    if (status === 'verified' || !signIn) {
      return;
    }

    const secondFactors = signIn.supportedSecondFactors
      .filter(factor => factor.strategy === 'phone_code')
      .map(phoneCodeFactor => phoneCodeFactor as PhoneCodeFactor);

    if (secondFactors.length === 0) {
      return;
    }

    const defaultIdentifier = secondFactors.find(factor => factor.default);
    const phoneNumberId = defaultIdentifier ? defaultIdentifier.phoneNumberId : secondFactors[0]?.phoneNumberId;

    signIn
      .prepareSecondFactor({
        strategy: 'phone_code',
        phoneNumberId,
      })
      .catch(err => handleError(err, [code], setError));
  };

  const verifyCode: VerifyCodeHandler = async (verify, reject) => {
    try {
      const response = await signIn.attemptSecondFactor({
        strategy: 'phone_code',
        code: code.value,
      });
      if (response.status === 'complete') {
        verify(() =>
          setActive({
            session: response.createdSessionId,
            beforeEmit: navigateAfterSignIn,
          }),
        );
      }
    } catch (err) {
      const globalErr = getGlobalError(err);
      if (globalErr && isVerificationExpiredError(globalErr)) {
        reject(VerificationErrorMessage.CodeExpired);
        return;
      }
      handleError(err, [], setError);
      reject(VerificationErrorMessage.Incorrect);
    }
  };

  const secondFactors = cachedSignInRef.current.supportedSecondFactors
    .filter(factor => factor.strategy === 'phone_code')
    .map(phoneCodeFactor => phoneCodeFactor as PhoneCodeFactor);

  const defaultIdentifier = secondFactors.find(factor => factor.default);
  const cachedSafeIdentifier = defaultIdentifier ? defaultIdentifier.safeIdentifier : secondFactors[0]?.safeIdentifier;

  return (
    <>
      <Header
        alert={error && <Alert type='error'>{error}</Alert>}
        showBack
        welcomeName={determineSalutation(cachedSignInRef.current)}
      />
      <Body>
        {cachedSafeIdentifier && (
          <Label className='cl-auth-form-message'>
            Enter the 6-digit code sent to
            <br />
            <strong>{cachedSafeIdentifier}</strong>
          </Label>
        )}
        <OneTimeCodeInput
          value={code.value}
          setValue={code.setValue}
          verifyCodeHandler={verifyCode}
          onResendCode={sendVerificationCode}
          className='cl-otp-input'
        />
      </Body>
    </>
  );
}

export const SignInFactorTwo = withRedirectToHome(_SignInFactorTwo);
