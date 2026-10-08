import { VerificationLinkCard } from '@/ui/elements/VerificationLinkCard';

import { EmailLinkStatusCard } from '../../common';
import { Flow, localizationKeys } from '../../customizables';
import type { useSignUpEmailLinkCardController } from './sign-up-email-link-card.controller';

export const SignUpEmailLinkCardView = ({
  showVerifyModal,
  emailAddress,
  onResend,
}: ReturnType<typeof useSignUpEmailLinkCardController>): JSX.Element => {
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
        identityPreviewEditButtonAriaLabel={localizationKeys('identityPreviewEditButton__emailAddress')}
        onResendCodeClicked={onResend}
        safeIdentifier={emailAddress}
      />
    </Flow.Part>
  );
};
