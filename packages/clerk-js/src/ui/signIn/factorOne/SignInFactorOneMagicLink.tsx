import { SignInFactor, SignInResource } from '@clerk/types';
import React from 'react';
import {
  buildMagicLinkRedirectUrl,
  ExpiredRetryMagicLinkWaitingScreen,
  handleError,
  Header,
  MagicLinkVerificationStatusModal,
  MagicLinkWaitingScreen,
} from 'ui/common';
import {
  useCoreClerk,
  useCoreSignIn,
  useEnvironment,
  useSignInContext,
} from 'ui/contexts';
import { useMagicLink,useNavigate } from 'ui/hooks';
import { SignInFactorOneFooter } from 'ui/signIn/factorOne/SignInFactorOneFooter';

type SignInFactorOneMagicLinkProps = {
  handleShowAllStrategies: () => any;
  currentFactor: SignInFactor;
};

export function SignInFactorOneMagicLink({
  handleShowAllStrategies,
  currentFactor,
}: SignInFactorOneMagicLinkProps): JSX.Element {
  const signIn = useCoreSignIn();
  const identifierRef = React.useRef(
    ('safe_identifier' in currentFactor && currentFactor.safe_identifier) || '',
  );
  const { setSession } = useCoreClerk();
  const { navigate } = useNavigate();
  const { displayConfig } = useEnvironment();
  const signInContext = useSignInContext();
  const { navigateAfterSignIn } = signInContext;
  const [error, setError] = React.useState<string | undefined>();
  const [showVerifyModal, setShowVerifyModal] = React.useState(false);
  const [showExpiredScreen, setShowExpiredScreen] = React.useState(false);

  const showMagicLinkVerificationModal = () => setShowVerifyModal(true);
  const showExpirationScreen = () => setShowExpiredScreen(true);
  const hideExpirationScreen = () => setShowExpiredScreen(false);

  const { startMagicLinkFlow } = useMagicLink(signIn);

  React.useEffect(() => {
    void startVerification();
  }, []);

  const startVerification = async () => {
    try {
      hideExpirationScreen();
      const si = await startMagicLinkFlow({
        emailAddressId: (currentFactor as any).email_address_id,
        redirectUrl: buildMagicLinkRedirectUrl(
          signInContext,
          displayConfig.signInUrl,
        ),
      });
      return handleVerificationResult(si);
    } catch (e) {
      handleError(e, [], setError);
    }
  };

  const handleVerificationResult = async (si: SignInResource) => {
    const ver = si.firstFactorVerification;
    if (ver.status === 'expired') {
      showExpirationScreen();
    } else if (ver.verifiedFromTheSameClient()) {
      showMagicLinkVerificationModal();
    } else {
      await completeSignInFlow(si);
    }
  };

  const completeSignInFlow = async (si: SignInResource) => {
    if (si.status === 'complete') {
      return setSession(si.createdSessionId, navigateAfterSignIn);
    } else if (si.status === 'needs_second_factor') {
      return navigate('../factor-two');
    }
  };

  const handleAnotherMethodClicked = () => {
    setError(undefined);
    handleShowAllStrategies();
  };

  if (showVerifyModal) {
    return (
      <MagicLinkVerificationStatusModal verificationStatus='verified_switch_tab' />
    );
  }

  return (
    <>
      <Header error={error} showLogo={false} showBack />
      {showExpiredScreen ? (
        <ExpiredRetryMagicLinkWaitingScreen
          onResendButtonClicked={startVerification}
        />
      ) : (
        <MagicLinkWaitingScreen
          icon='mail'
          header='Check your email'
          mainText={
            <>
              A sign-in link has been sent to
              <br />
              <span className='cl-verification-page-identifier'>
                {identifierRef.current}
              </span>
            </>
          }
          secondaryText='Click the link in the email, then return to this tab.'
          onResendButtonClicked={startVerification}
        />
      )}
      <SignInFactorOneFooter
        handleAnotherMethodClicked={handleAnotherMethodClicked}
      />
    </>
  );
}
