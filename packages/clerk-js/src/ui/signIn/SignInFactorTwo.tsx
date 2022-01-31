import React from 'react';
import { useCoreClerk, useCoreSignIn, useSignInContext } from 'ui/contexts';
import {
  Body,
  handleError,
  Header,
  useFieldState,
  withRedirectToHome,
  getGlobalError,
  isVerificationExpiredError,
  VerificationErrorMessage,
} from 'ui/common';
import { Label } from '@clerk/shared/components/label';
import {
  OneTimeCodeInput,
  VerifyCodeHandler,
} from '@clerk/shared/components/oneTimeCodeInput';
import { determineSalutation } from './utils';
import { PhoneCodeFactor, SignInResource } from '@clerk/types';

type SignInUiProps = Pick<
  SignInResource,
  'userData' | 'identifier' | 'supportedSecondFactors' | 'status'
>;

function _SignInFactorTwo(): JSX.Element {
  const { navigateAfterSignIn } = useSignInContext();
  const { setSession } = useCoreClerk();
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
    signIn
      .prepareSecondFactor({
        strategy: 'phone_code',
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
          setSession(response.createdSessionId, navigateAfterSignIn),
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
  const cachedSafeIdentifier = defaultIdentifier
    ? defaultIdentifier.safe_identifier
    : secondFactors[0]?.safe_identifier;

  return (
    <>
      <Header
        error={error}
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
