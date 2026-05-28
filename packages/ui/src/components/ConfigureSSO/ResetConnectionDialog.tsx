import { useReverification } from '@clerk/shared/react';

import { Col, localizationKeys } from '@/customizables';
import { Card } from '@/elements/Card';
import { useCardState, withCardStateProvider } from '@/elements/contexts';
import { Form } from '@/elements/Form';
import { FormButtonContainer } from '@/elements/FormButtons';
import { FormContainer } from '@/elements/FormContainer';
import { Modal } from '@/elements/Modal';
import { useFormControl } from '@/ui/utils/useFormControl';
import { handleError } from '@/utils/errorHandler';

import { useConfigureSSO } from './ConfigureSSOContext';
import { useWizard } from './elements/Wizard';

type ResetConnectionDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  /**
   * The string the user must type to enable the destructive submit button.
   * Today this is the organization name; long-term it may swap to the
   * connection's domain — the dialog stays agnostic so callers own the
   * canonical value.
   */
  confirmationValue: string;
};

const ResetConnectionDialogContent = withCardStateProvider((props: ResetConnectionDialogProps) => {
  const { onClose, confirmationValue } = props;
  const card = useCardState();
  const { enterpriseConnection, deleteEnterpriseConnection, setProvider } = useConfigureSSO();
  const { goToStep } = useWizard();

  const deleteConnection = useReverification((id: string) => deleteEnterpriseConnection(id));

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
      await deleteConnection(enterpriseConnection.id);
      setProvider(undefined);
      await goToStep('select-provider');
      onClose();
    } catch (err) {
      handleError(err as Error, [confirmationField], card.setError);
    }
  };

  return (
    <Card.Root>
      <Card.Content>
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
                  ignorePasswordManager
                />
              </Form.ControlRow>
              <FormButtonContainer>
                <Form.SubmitButton
                  block={false}
                  colorScheme='danger'
                  isDisabled={!canSubmit}
                  localizationKey={localizationKeys('configureSSO.resetConnectionDialog.resetButton')}
                />
                <Form.ResetButton
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

export const ResetConnectionDialog = (props: ResetConnectionDialogProps): JSX.Element | null => {
  if (!props.isOpen) {
    return null;
  }

  return (
    <Modal
      handleClose={props.onClose}
      containerSx={{ alignItems: 'center' }}
    >
      <ResetConnectionDialogContent {...props} />
    </Modal>
  );
};
