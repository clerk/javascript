import React from 'react';
import {
  useCoreClerk,
  useCoreSignUp,
  useEnvironment,
  useSignUpContext,
} from 'ui/contexts';
import { Body, Header } from 'ui/common/authForms';
import {
  handleError,
  PoweredByClerk,
  useFieldState,
  withRedirectToHome,
  shouldDisableStrategy,
  getGlobalError,
  isVerificationExpiredError,
  VerificationErrorMessage,
} from 'ui/common';
import { Label } from '@clerk/shared/components/label';
import {
  OneTimeCodeInput,
  VerifyCodeHandler,
} from '@clerk/shared/components/oneTimeCodeInput';
import { SignUpVerifyEmailAddressWithMagicLink } from './SignUpVerifyEmailAddressWithMagicLink';

const emailLinkStrategy = 'email_link';

function _SignUpVerifyEmailAddress(): JSX.Element {
  const { authConfig } = useEnvironment();
  const { firstFactors } = authConfig;

  // TODO: SignUp should have a field similar to SignIn's supportedFirstFactors
  // listing the available strategies for this signUp
  const emailLinkStrategyEnabled = firstFactors.includes(emailLinkStrategy);
  const disableEmailLink = shouldDisableStrategy(
    useSignUpContext(),
    emailLinkStrategy,
  );

  if (emailLinkStrategyEnabled && !disableEmailLink) {
    return <SignUpVerifyEmailAddressWithMagicLink />;
  }
  return VerifyWithOtp({ field: 'emailAddress' });
}

function _SignUpVerifyPhoneNumber(): JSX.Element {
  return VerifyWithOtp({ field: 'phoneNumber' });
}

function VerifyWithOtp({
  field,
}: {
  field: 'emailAddress' | 'phoneNumber';
}): JSX.Element {
  const { navigateAfterSignUp } = useSignUpContext();
  const { setSession } = useCoreClerk();
  const signUp = useCoreSignUp();
  const identifierRef = React.useRef(signUp[field] || '');
  const codeState = useFieldState('code', '');
  const [error, setError] = React.useState<string | undefined>();

  const prepareEmailAddressVerification = () => {
    const emailVerificationStatus = signUp.verifications.emailAddress.status;
    if (!signUp.status || emailVerificationStatus === 'verified') {
      return;
    }
    return signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
  };

  const attemptEmailAddressVerification = () => {
    return signUp.attemptEmailAddressVerification({ code: codeState.value });
  };

  const preparePhoneNumberVerification = () => {
    const phoneVerificationStatus = signUp.verifications.phoneNumber.status;
    if (!signUp.status || phoneVerificationStatus === 'verified') {
      return;
    }
    return signUp.preparePhoneNumberVerification({ strategy: 'phone_code' });
  };

  const attemptPhoneNumberVerification = () => {
    return signUp.attemptPhoneNumberVerification({ code: codeState.value });
  };

  const prepareVerification = () => {
    field === 'phoneNumber'
      ? preparePhoneNumberVerification()
      : prepareEmailAddressVerification();
  };

  React.useEffect(() => {
    void prepareVerification();
  }, []);

  const verifyCode: VerifyCodeHandler = async (verify, reject) => {
    try {
      const res = await (field === 'phoneNumber'
        ? attemptPhoneNumberVerification()
        : attemptEmailAddressVerification());

      if (res.status === 'complete') {
        verify(() => setSession(res.createdSessionId, navigateAfterSignUp));
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

  return (
    <>
      <Header error={error} />
      <Body>
        <Label className='cl-auth-form-message'>
          Enter the 6-digit code sent to
          <br />
          <strong>{identifierRef.current}</strong>
        </Label>
        <OneTimeCodeInput
          value={codeState.value}
          setValue={codeState.setValue}
          verifyCodeHandler={verifyCode}
          onResendCode={prepareVerification}
          className={'cl-otp-input'}
        />
      </Body>
      <PoweredByClerk className='cl-powered-by-clerk' />
    </>
  );
}

export const SignUpVerifyEmailAddress = withRedirectToHome(
  _SignUpVerifyEmailAddress,
);

export const SignUpVerifyPhoneNumber = withRedirectToHome(
  _SignUpVerifyPhoneNumber,
);
