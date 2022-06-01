import { SignUpResource } from '@clerk/types';
import React from 'react';
import {
  Body,
  buildMagicLinkRedirectUrl,
  ExpiredRetryMagicLinkWaitingScreen,
  handleError,
  MagicLinkVerificationStatusModal,
  MagicLinkWaitingScreen,
  PoweredByClerk,
} from 'ui/common';
import { Alert } from 'ui/common/alert';
import { useCoreClerk, useCoreSignUp, useEnvironment, useSignUpContext } from 'ui/contexts';
import { useMagicLink, useNavigate } from 'ui/hooks';
import { completeSignUpFlow } from 'ui/signUp/util';

export function SignUpVerifyEmailAddressWithMagicLink(): JSX.Element {
  const signUp = useCoreSignUp();
  const renderHappenedAfterTheDamnedSetSessionFlow = signUp.status === null;
  const { setSession } = useCoreClerk();
  const identifierRef = React.useRef(signUp.emailAddress);
  const { displayConfig } = useEnvironment();
  const signUpContext = useSignUpContext();
  const { navigate } = useNavigate();
  const { navigateAfterSignUp } = signUpContext;
  const [error, setError] = React.useState<string | undefined>();
  const [showVerifyModal, setShowVerifyModal] = React.useState(false);
  const [showExpiredScreen, setShowExpiredScreen] = React.useState(false);

  const showMagicLinkVerificationModal = () => setShowVerifyModal(true);
  const showExpirationScreen = () => setShowExpiredScreen(true);
  const hideExpirationScreen = () => setShowExpiredScreen(false);

  const { startMagicLinkFlow } = useMagicLink(signUp);

  React.useEffect(() => {
    if (renderHappenedAfterTheDamnedSetSessionFlow) {
      return;
    }
    void startVerification();
  }, []);

  async function startVerification() {
    try {
      hideExpirationScreen();
      const su = await startMagicLinkFlow({
        redirectUrl: buildMagicLinkRedirectUrl(signUpContext, displayConfig.signUpUrl),
      });
      return handleVerificationResult(su);
    } catch (e) {
      handleError(e, [], setError);
    }
  }

  const handleVerificationResult = async (su: SignUpResource) => {
    const ver = su.verifications.emailAddress;
    if (ver.status === 'expired') {
      showExpirationScreen();
    } else if (ver.verifiedFromTheSameClient()) {
      showMagicLinkVerificationModal();
    } else {
      await completeSignUpFlow({
        signUp: su,
        verifyEmailPath: '../verify-email-address',
        verifyPhonePath: '../verify-phone-number',
        handleComplete: () => setSession(su.createdSessionId, navigateAfterSignUp),
        navigate,
      });
    }
  };

  if (showVerifyModal) {
    return <MagicLinkVerificationStatusModal verificationStatus='verified_switch_tab' />;
  }

  return (
    <>
      {error && <Alert type='error'>{error}</Alert>}

      <Body className='cl-auth-form-body-center cl-verification-page-container'>
        {showExpiredScreen ? (
          <ExpiredRetryMagicLinkWaitingScreen onResendButtonClicked={startVerification} />
        ) : (
          <MagicLinkWaitingScreen
            icon='mail'
            header='Check your email'
            mainText={
              <>
                A sign-up link has been sent to
                <br />
                <span className='cl-verification-page-identifier'>{identifierRef.current}</span>
              </>
            }
            secondaryText='Click the link in the email to continue signing up, then return to
          this tab.'
            onResendButtonClicked={startVerification}
          />
        )}
      </Body>
      <PoweredByClerk className='cl-powered-by-clerk' />
    </>
  );
}
