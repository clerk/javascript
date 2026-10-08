import { MfaBackupCodeList } from '@/components/UserProfile/MfaBackupCodeList';
import { Form } from '@/elements/Form';
import { FormButtonContainer } from '@/elements/FormButtons';
import { FormContainer } from '@/elements/FormContainer';
import { Button, Col, descriptors, localizationKeys } from '@/ui/customizables';
import { SuccessPage } from '@/ui/elements/SuccessPage';

import type { useTotpVerifyController } from './totp-code-flow.controller';

export const TotpVerifyView = ({ controller }: { controller: ReturnType<typeof useTotpVerifyController> }) => (
  <FormContainer
    headerTitle={localizationKeys('taskSetupMfa.totpCode.verifyTotp.title')}
    headerTitleTextVariant='h2'
    headerSubtitle={localizationKeys('taskSetupMfa.totpCode.verifyTotp.subtitle')}
    badgeText={localizationKeys('taskSetupMfa.badge')}
  >
    <Col>
      <Form.OTPInput
        {...controller.otp}
        label={localizationKeys('taskSetupMfa.totpCode.verifyTotp.formTitle')}
        description={localizationKeys('taskSetupMfa.totpCode.verifyTotp.subtitle')}
      />
    </Col>
    <FormButtonContainer
      sx={theme => ({
        flexDirection: 'column',
        gap: theme.space.$4,
      })}
    >
      <Button
        onClick={() => controller.otp.onFakeContinue()}
        isDisabled={controller.otp.isLoading}
        hasArrow
        block
        localizationKey={localizationKeys('taskSetupMfa.totpCode.verifyTotp.formButtonPrimary')}
        elementDescriptor={descriptors.formButtonPrimary}
      />
      <Button
        onClick={() => controller.onReset?.()}
        variant='ghost'
        block
        isDisabled={controller.otp.isLoading}
        localizationKey={localizationKeys('taskSetupMfa.totpCode.verifyTotp.formButtonReset')}
        elementDescriptor={descriptors.formButtonReset}
      />
    </FormButtonContainer>
  </FormContainer>
);

export const TotpSuccessView = ({ backupCodes, onFinish }: { backupCodes?: string[]; onFinish: () => void }) => (
  <SuccessPage
    title={localizationKeys('taskSetupMfa.totpCode.success.title')}
    subtitle={localizationKeys('taskSetupMfa.totpCode.success.message1')}
    headerBadgeText={localizationKeys('taskSetupMfa.badge')}
    onFinish={onFinish}
    contents={
      <MfaBackupCodeList
        backupCodes={backupCodes}
        subtitle={localizationKeys('taskSetupMfa.totpCode.success.message2')}
      />
    }
    finishLabel={localizationKeys('taskSetupMfa.totpCode.success.finishButton')}
    finishButtonProps={{ block: true, hasArrow: true }}
  />
);
