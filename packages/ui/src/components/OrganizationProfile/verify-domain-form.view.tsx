import { Wizard } from '@/common';
import { Button, descriptors, Flex, localizationKeys, Spinner } from '@/customizables';
import { Alert } from '@/ui/elements/Alert';
import { Form } from '@/ui/elements/Form';
import { FormButtonContainer, FormButtons } from '@/ui/elements/FormButtons';
import type { FormProps } from '@/ui/elements/FormContainer';
import { FormContainer } from '@/ui/elements/FormContainer';

import { VerifiedDomainForm } from './VerifiedDomainForm';
import type { VerifyDomainFormData } from './verify-domain-form.types';

export const VerifyDomainFormView = ({
  controller,
  domainId,
  onSuccess,
  onReset,
}: {
  controller: VerifyDomainFormData;
  domainId: string;
  onSuccess: FormProps['onSuccess'];
  onReset: FormProps['onReset'];
}) => {
  if (controller.errorMessage) {
    return (
      <Form.Root onSubmit={controller.retry}>
        <Alert
          variant='danger'
          subtitle={controller.errorMessage}
        />
        <FormButtons
          onReset={onReset}
          submitLabel={localizationKeys('formButtonPrimary')}
        />
      </Form.Root>
    );
  }

  return (
    <Wizard {...controller.wizardProps}>
      <FormContainer
        headerTitle={localizationKeys('organizationProfile.verifyDomainPage.title')}
        headerSubtitle={localizationKeys('organizationProfile.verifyDomainPage.subtitle', {
          domainName: controller.domainName,
        })}
      >
        <Form.Root onSubmit={controller.onSubmitPrepare}>
          <Form.ControlRow elementId={controller.emailField.id}>
            <Form.InputGroup
              {...controller.emailField.props}
              autoFocus
              groupSuffix={controller.emailDomainSuffix}
              ignorePasswordManager
            />
          </Form.ControlRow>
          <FormButtons
            isDisabled={!controller.canSubmit}
            onReset={onReset}
          />
        </Form.Root>
      </FormContainer>

      <FormContainer
        headerTitle={localizationKeys('organizationProfile.verifyDomainPage.title')}
        headerSubtitle={localizationKeys('organizationProfile.verifyDomainPage.subtitleVerificationCodeScreen', {
          emailAddress: controller.verificationEmail,
        })}
      >
        <Form.OTPInput
          {...controller.otp}
          label={localizationKeys('organizationProfile.verifyDomainPage.formTitle')}
          description={localizationKeys('organizationProfile.verifyDomainPage.formSubtitle')}
          resendButton={localizationKeys('organizationProfile.verifyDomainPage.resendButton')}
        />

        <FormButtonContainer>
          <Button
            elementDescriptor={descriptors.formButtonReset}
            block={false}
            variant='ghost'
            textVariant='buttonSmall'
            type='reset'
            isDisabled={controller.otp.isLoading || controller.otp.otpControl.otpInputProps.feedbackType === 'success'}
            onClick={controller.onBack}
            localizationKey={localizationKeys('userProfile.formButtonReset')}
          />
        </FormButtonContainer>
      </FormContainer>

      <VerifiedDomainForm
        domainId={domainId}
        mode='select'
        onSuccess={onSuccess}
        onReset={onReset}
      />
    </Wizard>
  );
};

export const VerifyDomainLoadingView = () => (
  <Flex
    direction={'row'}
    align={'center'}
    justify={'center'}
  >
    <Spinner
      size={'lg'}
      colorScheme={'primary'}
      elementDescriptor={descriptors.spinner}
    />
  </Flex>
);
