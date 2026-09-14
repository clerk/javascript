import { appendModalState } from '@clerk/shared/internal/clerk-js/queryStateParams';
import { useSession } from '@clerk/shared/react';
import type { EmailLinkFactor } from '@clerk/shared/types';
import React from 'react';

import type { VerificationCodeCardProps } from '@/ui/elements/VerificationCodeCard';
import { VerificationLinkCard } from '@/ui/elements/VerificationLinkCard';
import { handleError } from '@/ui/utils/errorHandler';

import { Flow, localizationKeys, useLocalizations } from '../../customizables';
import { useCardState } from '../../elements/contexts';
import { useAfterVerification } from './use-after-verification';

type UVFactorOneEmailLinkCardProps = Pick<VerificationCodeCardProps, 'onShowAlternativeMethodsClicked'> & {
  factor: EmailLinkFactor;
  showAlternativeMethods: boolean;
};

export const UVFactorOneEmailLinkCard = (props: UVFactorOneEmailLinkCardProps) => {
  const { session } = useSession();
  const { t } = useLocalizations();
  const card = useCardState();
  const { handleVerificationResponse } = useAfterVerification();
  const emailLinkFlow = React.useMemo(() => session?.createEmailLinkFlow(), [session]);

  const startVerification = () => {
    if (!emailLinkFlow) {
      return;
    }
    const redirectUrl = appendModalState({
      url: window.location.href,
      componentName: 'UserVerification',
      startPath: '/user-verification',
      currentPath: '/verify',
    });

    emailLinkFlow
      .startEmailLinkFlow({ emailAddressId: props.factor.emailAddressId, redirectUrl })
      .then(result => {
        if (result.firstFactorVerification.status === 'expired') {
          card.setError(t(localizationKeys('formFieldError__verificationLinkExpired')));
          return;
        }
        return handleVerificationResponse(result);
      })
      .catch(err => handleError(err, [], card.setError));
  };

  React.useEffect(() => {
    void startVerification();
    return emailLinkFlow?.cancelEmailLinkFlow;
    // The flow is tied to the mounted factor card. Factor changes remount this card.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const restartVerification = () => {
    emailLinkFlow?.cancelEmailLinkFlow();
    card.setError(undefined);
    void startVerification();
  };

  return (
    <Flow.Part part='emailLink'>
      <VerificationLinkCard
        cardTitle={localizationKeys('reverification.emailLink.title')}
        cardSubtitle={localizationKeys('reverification.emailLink.subtitle')}
        formTitle={localizationKeys('reverification.emailLink.formTitle')}
        formSubtitle={localizationKeys('reverification.emailLink.formSubtitle')}
        resendButton={localizationKeys('reverification.emailLink.resendButton')}
        identityPreviewEditButtonAriaLabel={localizationKeys('identityPreviewEditButton__emailAddress')}
        onResendCodeClicked={restartVerification}
        safeIdentifier={props.factor.safeIdentifier}
        profileImageUrl={session?.user?.imageUrl}
        onShowAlternativeMethodsClicked={
          props.showAlternativeMethods ? props.onShowAlternativeMethodsClicked : undefined
        }
      />
    </Flow.Part>
  );
};
