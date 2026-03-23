import { useClerk } from '@clerk/shared/react';

import { descriptors } from '@/ui/customizables';
import { Card } from '@/ui/elements/Card';
import { Form } from '@/ui/elements/Form';
import { FormButtons } from '@/ui/elements/FormButtons';
import { FormContainer } from '@/ui/elements/FormContainer';
import { localizationKeys, useLocalizations } from '@/ui/localization';
import { useFormControl } from '@/ui/utils/useFormControl';

import { APIKeyModal } from './APIKeyModal';

type RevokeAPIKeyConfirmationModalProps = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  apiKeyID?: string;
  apiKeyName: string;
  onRevokeSuccess?: () => void;
  modalRoot?: React.MutableRefObject<HTMLElement | null>;
};

export const RevokeAPIKeyConfirmationModal = ({
  isOpen,
  onOpen,
  onClose,
  apiKeyID,
  apiKeyName,
  onRevokeSuccess,
  modalRoot,
}: RevokeAPIKeyConfirmationModalProps) => {
  const clerk = useClerk();
  const { t } = useLocalizations();

  const revokeField = useFormControl('apiKeyRevokeConfirmation', '', {
    type: 'text',
    label: `Type "Revoke" to confirm`,
    placeholder: 'Revoke',
    isRequired: true,
  });

  const canSubmit = revokeField.value === t(localizationKeys('apiKeys.revokeConfirmation.confirmationText'));

  const handleClose = () => {
    onClose();
    revokeField.setValue('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKeyID || !canSubmit) {
      return;
    }

    await clerk.apiKeys.revoke({ apiKeyID: apiKeyID });
    onRevokeSuccess?.();
    handleClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <APIKeyModal
      handleOpen={onOpen}
      handleClose={handleClose}
      canCloseModal={false}
      modalRoot={modalRoot}
    >
      <Card.Root
        role='alertdialog'
        elementDescriptor={descriptors.apiKeysRevokeModal}
      >
        <Card.Content
          sx={t => ({
            textAlign: 'start',
            padding: `${t.sizes.$4} ${t.sizes.$5} ${t.sizes.$4} ${t.sizes.$6}`,
          })}
        >
          <FormContainer
            headerTitle={localizationKeys('apiKeys.revokeConfirmation.formTitle', { apiKeyName })}
            headerSubtitle={localizationKeys('apiKeys.revokeConfirmation.formHint')}
          >
            <Form.Root onSubmit={handleSubmit}>
              <Form.ControlRow
                elementId={revokeField.id}
                elementDescriptor={descriptors.apiKeysRevokeModalInput}
              >
                <Form.PlainInput {...revokeField.props} />
              </Form.ControlRow>
              <FormButtons
                submitLabel={localizationKeys('apiKeys.revokeConfirmation.formButtonPrimary__revoke')}
                colorScheme='danger'
                isDisabled={!canSubmit}
                onReset={handleClose}
                elementDescriptor={descriptors.apiKeysRevokeModalSubmitButton}
              />
            </Form.Root>
          </FormContainer>
        </Card.Content>
      </Card.Root>
    </APIKeyModal>
  );
};
