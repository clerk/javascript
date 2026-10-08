import type { LocalizationKey } from '@/customizables';
import { Col, descriptors, localizationKeys } from '@/customizables';
import { Card } from '@/elements/Card';
import { Form } from '@/elements/Form';
import { FormButtonContainer } from '@/elements/FormButtons';
import { FormContainer } from '@/elements/FormContainer';

import type { useResetConnectionDialogController } from './reset-connection-dialog.controller';

export const ResetConnectionDialogContentView = ({
  onClose,
  title = localizationKeys('configureSSO.resetConnectionDialog.title'),
  subtitle,
  confirmButtonLabel = localizationKeys('configureSSO.resetConnectionDialog.resetButton'),
  confirmationFieldId,
  confirmationFieldProps,
  canSubmit,
  onSubmit,
}: {
  onClose: () => void;
  title?: LocalizationKey;
  subtitle: LocalizationKey;
  confirmButtonLabel?: LocalizationKey;
} & ReturnType<typeof useResetConnectionDialogController>): JSX.Element => {
  return (
    <Card.Root
      elementDescriptor={descriptors.configureSSOResetConnectionDialog}
      sx={t => ({ borderRadius: t.radii.$md })}
    >
      <Card.Content sx={t => ({ textAlign: 'start', padding: t.sizes.$5 })}>
        <FormContainer
          headerTitle={title}
          headerSubtitle={subtitle}
          sx={t => ({ gap: t.space.$4 })}
        >
          <Form.Root onSubmit={onSubmit}>
            <Col gap={4}>
              <Form.ControlRow elementId={confirmationFieldId}>
                <Form.PlainInput
                  {...confirmationFieldProps}
                  elementDescriptor={descriptors.configureSSOResetConnectionDialogConfirmationInput}
                  ignorePasswordManager
                />
              </Form.ControlRow>
              <FormButtonContainer>
                <Form.SubmitButton
                  elementDescriptor={descriptors.configureSSOResetConnectionDialogSubmitButton}
                  block={false}
                  colorScheme='danger'
                  isDisabled={!canSubmit}
                  localizationKey={confirmButtonLabel}
                />
                <Form.ResetButton
                  elementDescriptor={descriptors.configureSSOResetConnectionDialogCancelButton}
                  block={false}
                  localizationKey={localizationKeys('configureSSO.resetConnectionDialog.cancelButton')}
                  onClick={onClose}
                />
              </FormButtonContainer>
            </Col>
          </Form.Root>
        </FormContainer>
      </Card.Content>
    </Card.Root>
  );
};
