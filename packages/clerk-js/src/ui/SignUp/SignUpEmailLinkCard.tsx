import { SignUpResource } from '@clerk/types';
import React from 'react';

import { buildMagicLinkRedirectUrl } from '../../ui/common/redirects';
import { useCoreClerk, useCoreSignUp, useEnvironment, useSignUpContext } from '../../ui/contexts';
import { useNavigate } from '../../ui/hooks';
import { useMagicLink } from '../../ui/hooks/useMagicLink';
import { EmailLinkStatusCard } from '../common';
import { Flow, localizationKeys } from '../customizables';
import { VerificationLinkCard } from '../elements';
import { useCardState } from '../elements/contexts';
import { handleError } from '../utils';
import { completeSignUpFlow } from './util';

export const SignUpEmailLinkCard = () => {
  const signUp = useCoreSignUp();
  const signUpContext = useSignUpContext();
  const { navigateAfterSignUp } = signUpContext;
  const card = useCardState();
  const { displayConfig } = useEnvironment();
  const { navigate } = useNavigate();
  const { setActive } = useCoreClerk();
  const [showVerifyModal, setShowVerifyModal] = React.useState(false);

  const { startMagicLinkFlow, cancelMagicLinkFlow } = useMagicLink(signUp);

  React.useEffect(() => {
    void startEmailLinkVerification();
  }, []);

  const restartVerification = () => {
    cancelMagicLinkFlow();
    void startEmailLinkVerification();
  };

  const startEmailLinkVerification = () => {
    return startMagicLinkFlow({ redirectUrl: buildMagicLinkRedirectUrl(signUpContext, displayConfig.signUpUrl) })
      .then(res => handleVerificationResult(res))
      .catch(err => {
        handleError(err, [], card.setError);
      });
  };

  const handleVerificationResult = async (su: SignUpResource) => {
    const ver = su.verifications.emailAddress;
    if (ver.status === 'expired') {
      card.setError('The verification link expired. A replacement link has just been sent to your email address.');
      void startEmailLinkVerification();
    } else if (ver.verifiedFromTheSameClient()) {
      setShowVerifyModal(true);
    } else {
      await completeSignUpFlow({
        signUp: su,
        verifyEmailPath: '../verify-email-address',
        verifyPhonePath: '../verify-phone-number',
        handleComplete: () => setActive({ session: su.createdSessionId, beforeEmit: navigateAfterSignUp }),
        navigate,
      });
    }
  };

  if (showVerifyModal) {
    return (
      <EmailLinkStatusCard
        title='Successfully verified email'
        subtitle='Return to the newly opened tab to continue'
        status='verified_switch_tab'
      />
    );
  }

  return (
    <Flow.Part part='emailLink'>
      <VerificationLinkCard
        cardTitle={localizationKeys('signUp.emailLink.title')}
        cardSubtitle={localizationKeys('signUp.emailLink.subtitle')}
        formTitle={localizationKeys('signUp.emailLink.formTitle')}
        formSubtitle={localizationKeys('signUp.emailLink.formSubtitle')}
        resendButton={localizationKeys('signUp.emailLink.resendButton')}
        onResendCodeClicked={restartVerification}
        safeIdentifier={signUp.emailAddress || ''}
      />
    </Flow.Part>
  );
};
