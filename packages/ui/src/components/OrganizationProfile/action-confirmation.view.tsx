import { Wizard } from '@/common';
import type { LocalizationKey } from '@/customizables';
import { Col, localizationKeys, Text } from '@/customizables';
import { Form } from '@/ui/elements/Form';
import { FormButtonContainer } from '@/ui/elements/FormButtons';
import type { FormProps } from '@/ui/elements/FormContainer';
import { FormContainer } from '@/ui/elements/FormContainer';
import { SuccessPage } from '@/ui/elements/SuccessPage';

import type { useActionConfirmationController } from './action-confirmation.controller';

export const ActionConfirmationView = ({
  controller,
  title,
  messageLine1,
  messageLine2,
  submitLabel,
  successMessage,
  onSuccess,
  onReset,
  colorScheme,
}: {
  controller: ReturnType<typeof useActionConfirmationController>;
  title: LocalizationKey;
  messageLine1: LocalizationKey;
  messageLine2: LocalizationKey;
  submitLabel: LocalizationKey;
  successMessage: LocalizationKey;
  onSuccess: FormProps['onSuccess'];
  onReset: FormProps['onReset'];
  colorScheme: 'danger' | 'primary';
}) => (
  <Wizard {...controller.wizardProps}>
    <FormContainer
      headerTitle={title}
      gap={1}
    >
      <Form.Root onSubmit={controller.onSubmit}>
        <Col>
          <Text
            localizationKey={messageLine1}
            colorScheme='secondary'
          />
          <Text
            localizationKey={messageLine2}
            colorScheme='danger'
          />
        </Col>

        <Form.ControlRow elementId={controller.confirmationField.id}>
          <Form.PlainInput {...controller.confirmationField.props} />
        </Form.ControlRow>

        <FormButtonContainer>
          <Form.SubmitButton
            block={false}
            colorScheme={colorScheme}
            localizationKey={submitLabel}
            isDisabled={!controller.canSubmit}
          />
          <Form.ResetButton
            localizationKey={localizationKeys('userProfile.formButtonReset')}
            block={false}
            onClick={onReset}
          />
        </FormButtonContainer>
      </Form.Root>
    </FormContainer>
    <SuccessPage
      title={title}
      text={successMessage}
      onFinish={onSuccess}
    />
  </Wizard>
);
