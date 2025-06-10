import { useClerk } from '@clerk/shared/react';
import { useSWRConfig } from 'swr';

import { Card } from '@/ui/elements/Card';
import { Form } from '@/ui/elements/Form';
import { FormButtons } from '@/ui/elements/FormButtons';
import { FormContainer } from '@/ui/elements/FormContainer';
import { Modal } from '@/ui/elements/Modal';
import { localizationKeys } from '@/ui/localization';
import { useFormControl } from '@/ui/utils';

type RevokeAPIKeyConfirmationModalProps = {
  subject: string;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  apiKeyId?: string;
  apiKeyName?: string;
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKeyId) return;

    await clerk.apiKeys.revoke({ apiKeyID: apiKeyId });
    const cacheKey = { key: 'api-keys', subject };
    void mutate(cacheKey);
    onClose();
  };

  const revokeField = useFormControl('revokeConfirmation', '', {
    type: 'text',
    label: `Type "Revoke" to confirm`,
    placeholder: 'Revoke',
    isRequired: true,
  });

  // TODO: Maybe use secret key name for confirmation
  const canSubmit = revokeField.value === 'Revoke';

  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      handleOpen={onOpen}
      handleClose={onClose}
      canCloseModal={false}
      portalRoot={modalRoot}
      containerSx={[
        { alignItems: 'center' },
        modalRoot
          ? t => ({
              position: 'absolute',
              right: 0,
              bottom: 0,
              backgroundColor: 'inherit',
              backdropFilter: `blur(${t.sizes.$2})`,
              display: 'flex',
              justifyContent: 'center',
              minHeight: '100%',
              height: '100%',
              width: '100%',
            })
          : {},
      ]}
    >
      <Card.Root role='alertdialog'>
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
              <Form.ControlRow elementId={revokeField.id}>
                <Form.PlainInput {...revokeField.props} />
              </Form.ControlRow>
              <FormButtons
                submitLabel={localizationKeys('apiKeys.revokeConfirmation.formButtonPrimary__revoke')}
                colorScheme='danger'
                isDisabled={!canSubmit}
                onReset={onClose}
              />
            </Form.Root>
          </FormContainer>
        </Card.Content>
      </Card.Root>
    </Modal>
  );
};
