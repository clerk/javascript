import { useClerk } from '@clerk/shared/react';
import { useSWRConfig } from 'swr';

import { descriptors } from '@/ui/customizables';
import { Card } from '@/ui/elements/Card';
import { Form } from '@/ui/elements/Form';
import { FormButtons } from '@/ui/elements/FormButtons';
import { FormContainer } from '@/ui/elements/FormContainer';
import { localizationKeys, useLocalizations } from '@/ui/localization';
import { useFormControl } from '@/ui/utils/useFormControl';

import { ApiKeyModal } from './ApiKeyModal';

type RevokeAPIKeyConfirmationModalProps = {
  subject: string;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  apiKeyId?: string;
  apiKeyName: string;
  modalRoot?: React.MutableRefObject<HTMLElement | null>;
};

export const RevokeAPIKeyConfirmationModal = ({
  subject,
  isOpen,
  onOpen,
  onClose,
  apiKeyId,
  apiKeyName,
  modalRoot,
}: RevokeAPIKeyConfirmationModalProps) => {
  const clerk = useClerk();
  const { mutate } = useSWRConfig();
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
    if (!apiKeyId || !canSubmit) {
      return;
    }

    await clerk.apiKeys.revoke({ apiKeyID: apiKeyId });
    const cacheKey = { key: 'api-keys', subject };

    void mutate(cacheKey);
    handleClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <ApiKeyModal
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
            textAlign: 'left',
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
    </ApiKeyModal>
  );
};
