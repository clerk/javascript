import { isUserLockedError } from '@clerk/shared/error';
import { useClerk } from '@clerk/shared/react';
import type { EmailLinkFactor, SignInResource } from '@clerk/types';
import React from 'react';

import { EmailLinkStatusCard } from '../../common';
import { buildVerificationRedirectUrl } from '../../common/redirects';
import { useCoreSignIn, useSignInContext } from '../../contexts';
import { Flow, localizationKeys, useLocalizations } from '../../customizables';
import type { VerificationCodeCardProps } from '../../elements';
import { VerificationLinkCard } from '../../elements';
import { useCardState } from '../../elements/contexts';
import { useEmailLink } from '../../hooks/useEmailLink';
import { useRouter } from '../../router/RouteContext';
import { handleError } from '../../utils';

type SignInFactorOneEmailLinkCardProps = Pick<VerificationCodeCardProps, 'onShowAlternativeMethodsClicked'> & {
  factor: EmailLinkFactor;
  factorAlreadyPrepared: boolean;
  onFactorPrepare: () => void;
};

export const SignInFactorOneEmailLinkCard = (props: SignInFactorOneEmailLinkCardProps) => {
  const { t } = useLocalizations();
  const card = useCardState();
  const signIn = useCoreSignIn();
  const signInContext = useSignInContext();
  const { signInUrl } = signInContext;
  const { navigate } = useRouter();
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
      redirectUrl: buildVerificationRedirectUrl(signInContext, signInUrl),
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
    const ver = si.firstFactorVerification;
    if (ver.status === 'expired') {
      card.setError(t(localizationKeys('formFieldError__verificationLinkExpired')));
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
        redirectUrl: afterSignInUrl,
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
