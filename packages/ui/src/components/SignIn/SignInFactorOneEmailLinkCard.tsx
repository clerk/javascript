import type { EmailLinkFactor, SignInResource } from '@clerk/shared/types';
import React from 'react';

import type { VerificationCodeCardProps } from '@/ui/elements/VerificationCodeCard';
import { VerificationLinkCard } from '@/ui/elements/VerificationLinkCard';
import { handleError } from '@/ui/utils/errorHandler';

import { EmailLinkStatusCard } from '../../common';
import { Flow, localizationKeys, useLocalizations } from '../../customizables';
import { useCardState } from '../../elements/contexts';
import { useEmailLink } from '../../hooks/useEmailLink';

type SignInFactorOneEmailLinkCardProps = Pick<VerificationCodeCardProps, 'onShowAlternativeMethodsClicked'> & {
  factor: EmailLinkFactor;
  factorAlreadyPrepared: boolean;
  onFactorPrepare: () => void;
  signIn: SignInResource;
  onVerificationComplete: (si: SignInResource) => Promise<void>;
  onUserLockedError: (err: unknown) => boolean;
  avatarUrl: string | undefined;
  redirectUrl: string;
};

export const SignInFactorOneEmailLinkCard = (props: SignInFactorOneEmailLinkCardProps) => {
  const { t } = useLocalizations();
  const card = useCardState();
  const { startEmailLinkFlow, cancelEmailLinkFlow } = useEmailLink(props.signIn);
  const [showVerifyModal, setShowVerifyModal] = React.useState(false);

  React.useEffect(() => {
    void startEmailLinkVerification();
  }, []);

  const restartVerification = () => {
    cancelEmailLinkFlow();
    void startEmailLinkVerification();
  };

  const startEmailLinkVerification = () => {
    startEmailLinkFlow({
      emailAddressId: props.factor.emailAddressId,
      redirectUrl: props.redirectUrl,
    })
      .then(res => handleVerificationResult(res))
      .catch(err => {
        if (props.onUserLockedError(err)) {
          return;
        }
        handleError(err, [], card.setError);
      });
  };

  const handleVerificationResult = async (si: SignInResource) => {
    const ver = si.firstFactorVerification;
    if (ver.status === 'expired') {
      card.setError(t(localizationKeys('formFieldError__verificationLinkExpired')));
    } else if (ver.verifiedFromTheSameClient()) {
      setShowVerifyModal(true);
    } else {
      await props.onVerificationComplete(si);
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
        profileImageUrl={props.avatarUrl}
        onShowAlternativeMethodsClicked={props.onShowAlternativeMethodsClicked}
      />
    </Flow.Part>
  );
};
