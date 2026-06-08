import { Col, descriptors, localizationKeys } from '@/customizables';
import { Card } from '@/elements/Card';
import { useCardState, withCardStateProvider } from '@/elements/contexts';
import { Form } from '@/elements/Form';
import { FormButtonContainer } from '@/elements/FormButtons';
import { FormContainer } from '@/elements/FormContainer';
import { Modal } from '@/elements/Modal';
import { useFormControl } from '@/ui/utils/useFormControl';
import { handleError } from '@/utils/errorHandler';

import { useConfigureSSO } from './ConfigureSSOContext';

type ResetConnectionDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  confirmationValue: string;
};

export const ResetConnectionDialog = (props: ResetConnectionDialogProps): JSX.Element | null => {
  const { contentRef } = useConfigureSSO();

  if (!props.isOpen) {
    return null;
  }

  return (
    <Modal
      handleClose={props.onClose}
      canCloseModal={false}
      portalRoot={contentRef}
      containerSx={t => ({
        alignItems: 'center',
        position: 'absolute',
        inset: 0,
        width: 'auto',
        height: 'auto',
        backgroundColor: 'inherit',
        backdropFilter: `blur(${t.sizes.$2})`,
      })}
    >
      <ResetConnectionDialogContent {...props} />
    </Modal>
  );
};

const ResetConnectionDialogContent = withCardStateProvider((props: ResetConnectionDialogProps) => {
  const { onClose, confirmationValue } = props;
  const card = useCardState();
  const { enterpriseConnection, resetConnection } = useConfigureSSO();

  const confirmationField = useFormControl('deleteConfirmation', '', {
    type: 'text',
    label: localizationKeys('configureSSO.resetConnectionDialog.confirmationFieldLabel', {
      name: confirmationValue,
    }),
    isRequired: true,
    placeholder: confirmationValue,
  });

  const canSubmit = Boolean(confirmationValue && confirmationField.value === confirmationValue);

  const onSubmit = async () => {
    if (!enterpriseConnection || !canSubmit) {
      return;
    }

    try {
      // `resetConnection` deletes the connection — a pure delete, no navigation.
      // Dropping `hasConnection` breaks the active step's entry guard, so the
      // wizard self-corrects to the furthest-reachable step. No `useWizard()`
      // here — that lets this dialog be triggered from ANY footer (including the
      // nested SAML configure footers) without binding to a nested wizard.
      await resetConnection();
      onClose();
    } catch (err) {
      handleError(err as Error, [confirmationField], card.setError);
    }
  };

  return (
    <Card.Root
      elementDescriptor={descriptors.configureSSOResetConnectionDialog}
      sx={t => ({ borderRadius: t.radii.$md })}
    >
      <Card.Content sx={t => ({ textAlign: 'start', padding: t.sizes.$5 })}>
        <FormContainer
          headerTitle={localizationKeys('configureSSO.resetConnectionDialog.title')}
          headerSubtitle={localizationKeys('configureSSO.resetConnectionDialog.subtitle')}
          sx={t => ({ gap: t.space.$4 })}
        >
          <Form.Root onSubmit={onSubmit}>
            <Col gap={4}>
              <Form.ControlRow elementId={confirmationField.id}>
                <Form.PlainInput
                  {...confirmationField.props}
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
                  localizationKey={localizationKeys('configureSSO.resetConnectionDialog.resetButton')}
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
});
