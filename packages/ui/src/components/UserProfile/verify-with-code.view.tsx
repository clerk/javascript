import { Button, descriptors, localizationKeys } from '@/ui/customizables';
import { Form } from '@/ui/elements/Form';
import { FormButtonContainer } from '@/ui/elements/FormButtons';

import type { VerifyWithCodeViewData } from './verification-code.types';

export const VerifyWithCodeView = ({ controller }: { controller: VerifyWithCodeViewData }) => (
  <>
    <Form.OTPInput
      {...controller.otp}
      label={localizationKeys('userProfile.emailAddressPage.emailCode.formTitle')}
      description={localizationKeys('userProfile.emailAddressPage.emailCode.formSubtitle', {
        identifier: controller.identifier,
      })}
      resendButton={localizationKeys('userProfile.emailAddressPage.emailCode.resendButton')}
      centerAlign={false}
    />
    <FormButtonContainer>
      <Button
        isLoading={controller.otp.isLoading}
        localizationKey={localizationKeys('formButtonPrimary__verify')}
        elementDescriptor={descriptors.formButtonPrimary}
        onClick={controller.otp.onFakeContinue}
      />
      <Button
        variant='ghost'
        isDisabled={controller.otp.isLoading}
        localizationKey={localizationKeys('userProfile.formButtonReset')}
        elementDescriptor={descriptors.formButtonReset}
        onClick={controller.onReset}
      />
    </FormButtonContainer>
  </>
);
