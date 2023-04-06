import type { EmailLinkFactor, SignInResource } from '@clerk/types';
import React from 'react';

import { EmailLinkStatusCard } from '../../common';
import { buildMagicLinkRedirectUrl } from '../../common/redirects';
import { useCoreClerk, useCoreSignIn, useEnvironment, useSignInContext } from '../../contexts';
import { Flow, localizationKeys } from '../../customizables';
import type { VerificationCodeCardProps } from '../../elements';
import { VerificationLinkCard } from '../../elements';
import { useCardState } from '../../elements/contexts';
import { useMagicLink } from '../../hooks/useMagicLink';
import { useRouter } from '../../router/RouteContext';
import { handleError } from '../../utils';

type SignInFactorOneEmailLinkCardProps = Pick<VerificationCodeCardProps, 'onShowAlternativeMethodsClicked'> & {
  factor: EmailLinkFactor;
  factorAlreadyPrepared: boolean;
  onFactorPrepare: () => void;
};

export const SignInFactorOneEmailLinkCard = (props: SignInFactorOneEmailLinkCardProps) => {
  const card = useCardState();
  const signIn = useCoreSignIn();
  const signInContext = useSignInContext();
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
      card.setError('The verification link expired. Please resend it.');
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
        title={localizationKeys('signIn.emailLink.verifiedSwitchTab.titleNewTab')}
        subtitle={localizationKeys('signIn.emailLink.verifiedSwitchTab.subtitleNewTab')}
        status='verified_switch_tab'
      />
    );
  }

  return (
    <Flow.Part part='emailLink'>
      <VerificationLinkCard
        cardTitle={localizationKeys('signIn.emailLink.title')}
        cardSubtitle={localizationKeys('signIn.emailLink.subtitle')}
        formTitle={localizationKeys('signIn.emailLink.formTitle')}
        formSubtitle={localizationKeys('signIn.emailLink.formSubtitle')}
        resendButton={localizationKeys('signIn.emailLink.resendButton')}
        onResendCodeClicked={restartVerification}
        safeIdentifier={props.factor.safeIdentifier}
        profileImageUrl={signIn.userData.imageUrl}
        onShowAlternativeMethodsClicked={props.onShowAlternativeMethodsClicked}
      />
    </Flow.Part>
  );
};
