import { useClerk } from '@clerk/shared/react';
import type { SignUpResource } from '@clerk/shared/types';
import React from 'react';

import { VerificationLinkCard } from '@/ui/elements/VerificationLinkCard';
import { handleError } from '@/ui/utils/errorHandler';

import { EmailLinkStatusCard } from '../../common';
import { useCoreSignUp, useSignUpContext } from '../../contexts';
import { Flow, localizationKeys, useLocalizations } from '../../customizables';
import { useCardState } from '../../elements/contexts';
import { useEmailLink } from '../../hooks/useEmailLink';
import { useRouter } from '../../router';
import { completeSignUpFlow } from './util';

export const SignUpEmailLinkCard = () => {
  const { t } = useLocalizations();
  const signUp = useCoreSignUp();
  const signUpContext = useSignUpContext();
  const { afterSignUpUrl, navigateOnSetActive } = signUpContext;
  const card = useCardState();
  const { navigate } = useRouter();
  const { setActive } = useClerk();
  const [showVerifyModal, setShowVerifyModal] = React.useState(false);

  const { startEmailLinkFlow, cancelEmailLinkFlow } = useEmailLink(signUp);

  React.useEffect(() => {
    void startEmailLinkVerification();
  }, []);

  const restartVerification = () => {
    cancelEmailLinkFlow();
    void startEmailLinkVerification();
  };

  const startEmailLinkVerification = () => {
    return startEmailLinkFlow({
      redirectUrl: signUpContext.emailLinkRedirectUrl,
    })
      .then(res => handleVerificationResult(res))
      .catch(err => {
        handleError(err, [], card.setError);
      });
  };

  const handleVerificationResult = async (su: SignUpResource) => {
    const ver = su.verifications.emailAddress;
    if (ver.status === 'expired') {
      card.setError(t(localizationKeys('formFieldError__verificationLinkExpired')));
    } else if (ver.verifiedFromTheSameClient()) {
      setShowVerifyModal(true);
    } else {
      await completeSignUpFlow({
        signUp: su,
        continuePath: '../continue',
        verifyEmailPath: '../verify-email-address',
        verifyPhonePath: '../verify-phone-number',
        handleComplete: () =>
          setActive({
            session: su.createdSessionId,
            navigate: async ({ session, decorateUrl }) => {
              await navigateOnSetActive({ session, redirectUrl: afterSignUpUrl, decorateUrl });
            },
          }),
        navigate,
      });
    }
  };

  if (showVerifyModal) {
    return (
      <EmailLinkStatusCard
        title={localizationKeys('signUp.emailLink.verifiedSwitchTab.title')}
        subtitle={localizationKeys('signUp.emailLink.verifiedSwitchTab.subtitleNewTab')}
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
        safeIdentifier={signUp.emailAddress}
      />
    </Flow.Part>
  );
};
