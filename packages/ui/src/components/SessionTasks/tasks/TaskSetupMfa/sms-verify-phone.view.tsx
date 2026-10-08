import { VerificationCodeContent } from '@/elements/VerificationCodeCard';
import { localizationKeys } from '@/ui/customizables';
import { Card } from '@/ui/elements/Card';

import type { useSmsVerifyPhoneController } from './sms-verify-phone.controller';

export const SmsVerifyPhoneView = ({ controller }: { controller: ReturnType<typeof useSmsVerifyPhoneController> }) => (
  <Card.Content>
    <VerificationCodeContent
      cardTitle={localizationKeys('taskSetupMfa.smsCode.verifyPhone.title')}
      cardSubtitle={localizationKeys('taskSetupMfa.smsCode.verifyPhone.subtitle')}
      safeIdentifier={controller.phoneNumber}
      inputLabel={localizationKeys('taskSetupMfa.smsCode.verifyPhone.formTitle')}
      resendButton={localizationKeys('taskSetupMfa.smsCode.verifyPhone.resendButton')}
      identityPreviewEditButtonAriaLabel={localizationKeys('identityPreviewEditButton__phoneNumber')}
      badgeText={localizationKeys('taskSetupMfa.badge')}
      onCodeEntryFinishedAction={controller.onCodeEntryFinishedAction}
      onResendCodeClicked={controller.onResendCodeClicked}
      onIdentityPreviewEditClicked={controller.onReset}
      onBackLinkClicked={controller.onReset}
      backLinkLabel={localizationKeys('taskSetupMfa.smsCode.cancel')}
    />
  </Card.Content>
);
