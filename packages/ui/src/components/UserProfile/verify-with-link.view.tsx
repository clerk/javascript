import { EmailLinkStatusCard } from '@/ui/common';
import { Button, descriptors, localizationKeys } from '@/ui/customizables';
import { FormButtonContainer } from '@/ui/elements/FormButtons';
import { VerificationLink } from '@/ui/elements/VerificationLinkCard';

import type { EmailVerificationViewData } from './email-form.types';

export const VerifyWithLinkView = ({ controller }: { controller: EmailVerificationViewData }) => (
  <>
    <VerificationLink
      resendButton={localizationKeys('userProfile.emailAddressPage.emailLink.resendButton')}
      onResendCodeClicked={controller.startVerification}
    />
    <FormButtonContainer>
      <Button
        variant='ghost'
        localizationKey={localizationKeys('userProfile.formButtonReset')}
        elementDescriptor={descriptors.formButtonReset}
        onClick={controller.onReset}
      />
    </FormButtonContainer>
  </>
);

export const VerificationSuccessPageView = () => (
  <EmailLinkStatusCard
    title={localizationKeys('signUp.emailLink.verifiedSwitchTab.title')}
    subtitle={localizationKeys('signUp.emailLink.verifiedSwitchTab.subtitle')}
    status='verified'
  />
);
