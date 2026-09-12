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
import { useRouter } from '../../router/RouteContext';
import { navigateOnSignInProtectGate } from './handleProtectCheck';
import { handleSignUpIfMissingTransfer } from './handleSignUpIfMissingTransfer';

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
  const { signInUrl, afterSignInUrl, afterSignUpUrl, signUpIfMissingEnabled, navigateOnSetActive } = signInContext;
  const { navigate } = useRouter();
  const { setActive } = useClerk();
  const { startEmailLinkFlow, cancelEmailLinkFlow } = useEmailLink(signIn);
  const [switchTabStatus, setSwitchTabStatus] = React.useState<'verified_switch_tab' | 'transferable' | null>(null);
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
    const ver = si.firstFactorVerification;
    if (ver.status === 'expired') {
      card.setError(t(localizationKeys('formFieldError__verificationLinkExpired')));
    } else if (signUpIfMissingEnabled && ver.status === 'transferable') {
      // This tab is the sole consumer of the banked account transfer, whichever tab the link
      // opened in. `verifiedFromTheSameClient()` cannot arbitrate that: it compares
      // `verifiedAtClient` against this client, and on a development instance the link click
      // reaches FAPI without dev-browser context, so it reports false even when the link opened
      // in a tab of this same browser. Letting the opened tab transfer as well makes both fire,
      // and the loser's rejected create detaches the winner's sign-up server-side (cleanUpClient
      // in the FAPI sign-up create handler), stranding the flow with no sign-up at all.
      return handleSignUpIfMissingTransfer({
        clerk,
        navigate,
        afterSignUpUrl,
        navigateOnSetActive,
        unsafeMetadata: signInContext.unsafeMetadata,
      });
    } else if (ver.verifiedFromTheSameClient()) {
      setSwitchTabStatus('verified_switch_tab');
    } else {
      await completeSignInFlow(si);
    }
  };

  const completeSignInFlow = async (si: SignInResource) => {
    // An email-link verification can resolve into a protect_check gate; route to it before
    // dispatching on the underlying status, otherwise the user is stranded on the link card.
    if (navigateOnSignInProtectGate(si, navigate, '../protect-check')) {
      return;
    }
    if (si.status === 'complete') {
      return setActive({
        session: si.createdSessionId,
        redirectUrl: afterSignInUrl,
      });
    } else if (si.status === 'needs_second_factor') {
      return navigate('../factor-two');
    }
  };

  if (switchTabStatus) {
    return (
      <EmailLinkStatusCard
        title={
          switchTabStatus === 'transferable'
            ? localizationKeys('signIn.emailLink.verifiedTransferable.title')
            : localizationKeys('signIn.emailLink.verifiedSwitchTab.titleNewTab')
        }
        // "Return to the newly opened tab to continue" reads the same for both statuses, so the
        // transferable card reuses it rather than duplicating the string across every locale.
        subtitle={localizationKeys('signIn.emailLink.verifiedSwitchTab.subtitleNewTab')}
        status={switchTabStatus}
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
        identityPreviewEditButtonAriaLabel={localizationKeys('identityPreviewEditButton__emailAddress')}
        onResendCodeClicked={restartVerification}
        safeIdentifier={props.factor.safeIdentifier}
        profileImageUrl={signIn.userData.imageUrl}
        onShowAlternativeMethodsClicked={props.onShowAlternativeMethodsClicked}
      />
    </Flow.Part>
  );
};
