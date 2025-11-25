import { isUserLockedError } from '@clerk/shared/error';
import { useClerk } from '@clerk/shared/react';
import type { EmailLinkFactor, SignInResource } from '@clerk/shared/types';
import React from 'react';

import type { VerificationCodeCardProps } from '@/ui/elements/VerificationCodeCard';
import { VerificationLinkCard } from '@/ui/elements/VerificationLinkCard';
import { handleError } from '@/ui/utils/errorHandler';

import { EmailLinkStatusCard } from '../../common';
import { buildVerificationRedirectUrl } from '../../common/redirects';
import { useCoreSignIn, useSignInContext } from '../../contexts';
import { Flow, localizationKeys, useLocalizations } from '../../customizables';
import { useCardState } from '../../elements/contexts';
import { useEmailLink } from '../../hooks/useEmailLink';

type SignInFactorTwoEmailLinkCardProps = Pick<VerificationCodeCardProps, 'onShowAlternativeMethodsClicked'> & {
  factor: EmailLinkFactor;
  factorAlreadyPrepared: boolean;
  onFactorPrepare: () => void;
};

const isNewDevice = (resource: SignInResource) => resource.clientTrustState === 'new';

export const SignInFactorTwoEmailLinkCard = (props: SignInFactorTwoEmailLinkCardProps) => {
  const { t } = useLocalizations();
  const card = useCardState();
  const signIn = useCoreSignIn();
  const signInContext = useSignInContext();
  const { signInUrl } = signInContext;
  const { afterSignInUrl } = useSignInContext();
  const { setActive } = useClerk();
  const { startEmailLinkFlow, cancelEmailLinkFlow } = useEmailLink(signIn);
  const [showVerifyModal, setShowVerifyModal] = React.useState(false);
  const clerk = useClerk();

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
      redirectUrl: buildVerificationRedirectUrl({ ctx: signInContext, baseUrl: signInUrl, intent: 'sign-in' }),
    })
      .then(res => handleVerificationResult(res))
      .catch(err => {
        if (isUserLockedError(err)) {
          // @ts-expect-error -- private method for the time being
          return clerk.__internal_navigateWithError('..', err.errors[0]);
        }

        handleError(err, [], card.setError);
      });
  };

  const handleVerificationResult = async (si: SignInResource) => {
    const ver = si.secondFactorVerification;
    if (ver.status === 'expired') {
      card.setError(t(localizationKeys('formFieldError__verificationLinkExpired')));
    } else if (ver.verifiedFromTheSameClient()) {
      setShowVerifyModal(true);
    } else {
      await setActive({
        session: si.createdSessionId,
        redirectUrl: afterSignInUrl,
      });
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
        cardTitle={localizationKeys('signIn.emailLinkMfa.title')}
        cardSubtitle={localizationKeys('signIn.emailLinkMfa.subtitle')}
        cardNotice={isNewDevice(signIn) ? localizationKeys('signIn.newDeviceVerificationNotice') : undefined}
        formSubtitle={localizationKeys('signIn.emailLinkMfa.formSubtitle')}
        resendButton={localizationKeys('signIn.emailLinkMfa.resendButton')}
        onResendCodeClicked={restartVerification}
        safeIdentifier={props.factor.safeIdentifier}
        profileImageUrl={signIn.userData.imageUrl}
        onShowAlternativeMethodsClicked={props.onShowAlternativeMethodsClicked}
      />
    </Flow.Part>
  );
};
