import { EmailLinkFactor, SignInResource } from '@clerk/types';
import React from 'react';

import { buildMagicLinkRedirectUrl } from '../../ui/common/redirects';
import { useCoreClerk, useCoreSignIn, useEnvironment, useSignInContext } from '../../ui/contexts';
import { useMagicLink } from '../../ui/hooks/useMagicLink';
import { useRouter } from '../../ui/router/RouteContext';
import { EmailLinkStatusCard } from '../common';
import { Flow } from '../customizables';
import { VerificationCodeCardProps, VerificationLinkCard } from '../elements';
import { useCardState } from '../elements/contexts';
import { handleError } from '../utils';

type SignInFactorOneEmailLinkCardProps = Pick<VerificationCodeCardProps, 'onShowAlternativeMethodsClicked'> & {
  factor: EmailLinkFactor;
  factorAlreadyPrepared: boolean;
  onFactorPrepare: () => void;
};

export const SignInFactorOneEmailLinkCard = (props: SignInFactorOneEmailLinkCardProps) => {
  const card = useCardState();
  const signIn = useCoreSignIn();
  const signInContext = useSignInContext();
  const { displayConfig } = useEnvironment();
  const { signInUrl } = useEnvironment().displayConfig;
  const { navigate } = useRouter();
  const { navigateAfterSignIn } = useSignInContext();
  const { setActive } = useCoreClerk();
  const { startMagicLinkFlow, cancelMagicLinkFlow } = useMagicLink(signIn);
  const [showVerifyModal, setShowVerifyModal] = React.useState(false);

  React.useEffect(() => {
    void startEmailLinkVerification();
  }, []);

  const restartVerification = () => {
    cancelMagicLinkFlow();
    void startEmailLinkVerification();
  };

  const startEmailLinkVerification = () => {
    startMagicLinkFlow({
      emailAddressId: props.factor.emailAddressId,
      redirectUrl: buildMagicLinkRedirectUrl(signInContext, signInUrl),
    })
      .then(res => handleVerificationResult(res))
      .catch(err => handleError(err, [], card.setError));
  };

  const handleVerificationResult = async (si: SignInResource) => {
    const ver = si.firstFactorVerification;
    if (ver.status === 'expired') {
      card.setError('The verification link expired. A replacement link has just been sent to your email address.');
      void startEmailLinkVerification();
    } else if (ver.verifiedFromTheSameClient()) {
      setShowVerifyModal(true);
    } else {
      await completeSignInFlow(si);
    }
  };

  const completeSignInFlow = async (si: SignInResource) => {
    if (si.status === 'complete') {
      return setActive({
        session: si.createdSessionId,
        beforeEmit: navigateAfterSignIn,
      });
    } else if (si.status === 'needs_second_factor') {
      return navigate('../factor-two');
    }
  };

  if (showVerifyModal) {
    return (
      <EmailLinkStatusCard
        title='Signed in on other tab'
        subtitle='Return to the newly opened tab to continue'
        status='verified_switch_tab'
      />
    );
  }

  return (
    <Flow.Part part='emailLink'>
      <VerificationLinkCard
        cardTitle='Check your email'
        cardSubtitle={`to continue to ${displayConfig.applicationName}`}
        formTitle='Verification link'
        formSubtitle='Use the verification link sent your email'
        onResendCodeClicked={restartVerification}
        safeIdentifier={props.factor.safeIdentifier}
        profileImageUrl={signIn.userData.profileImageUrl}
        onShowAlternativeMethodsClicked={props.onShowAlternativeMethodsClicked}
      />
    </Flow.Part>
  );
};
