import { Button, Col, descriptors, localizationKeys } from '@/ui/customizables';
import { Form } from '@/ui/elements/Form';
import { FormButtonContainer } from '@/ui/elements/FormButtons';
import { FormContainer } from '@/ui/elements/FormContainer';

import type { useVerifyTOTPController } from './verify-totp.controller';

export const VerifyTOTPView = ({ controller }: { controller: ReturnType<typeof useVerifyTOTPController> }) => (
  <FormContainer headerTitle={localizationKeys('userProfile.mfaTOTPPage.title')}>
    <Col>
      <Form.OTPInput
        {...controller.otp}
        label={localizationKeys('userProfile.mfaTOTPPage.verifyTitle')}
        description={localizationKeys('userProfile.mfaTOTPPage.verifySubtitle')}
      />
    </Col>

    <FormButtonContainer sx={{ marginTop: 0 }}>
      <Button
        onClick={controller.onReset}
        variant='ghost'
        isDisabled={controller.otp.isLoading}
        localizationKey={localizationKeys('userProfile.formButtonReset')}
        elementDescriptor={descriptors.formButtonReset}
      />

      <Button
        onClick={controller.onBack}
        variant='ghost'
        isDisabled={controller.otp.isLoading}
        localizationKey={localizationKeys('backButton')}
        elementDescriptor={descriptors.backLink}
      />
    </FormButtonContainer>
  </FormContainer>
);
