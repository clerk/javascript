import { Button, descriptors, Flex, localizationKeys } from '@/ui/customizables';
import { FormButtonContainer } from '@/ui/elements/FormButtons';

import type { EmailVerificationViewData } from './email-form.types';

export const VerifyWithEnterpriseConnectionView = ({ controller }: { controller: EmailVerificationViewData }) => (
  <>
    <Flex justify='center'>
      <Button
        variant='link'
        onClick={() => void controller.openVerification()}
        localizationKey={localizationKeys('userProfile.emailAddressPage.enterpriseSSOLink.formButton')}
      />
    </Flex>
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
