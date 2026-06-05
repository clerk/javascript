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
import { useWizard } from './elements/Wizard';

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
  const {
    enterpriseConnection,
    mutations: { deleteConnection },
  } = useConfigureSSO();
  const { goToStep } = useWizard();

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
      // The delete revalidates the source, dropping `hasConnection`, so every
      // later step's entry guard fails. Jump back to the entry step
      // (`verify-domain`, guard-less ⇒ always reachable). `goToStep` resolves
      // against the TOP-LEVEL wizard because this dialog renders under it.
      goToStep('verify-domain');
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
