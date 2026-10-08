import { descriptors } from '@/ui/customizables';
import { Card } from '@/ui/elements/Card';
import { Form } from '@/ui/elements/Form';
import { FormButtons } from '@/ui/elements/FormButtons';
import { FormContainer } from '@/ui/elements/FormContainer';
import { localizationKeys } from '@/ui/localization';

import type { RevokeAPIKeyData } from './api-keys.types';
import { APIKeyModal } from './APIKeyModal';

export const RevokeAPIKeyView = ({ controller }: { controller: RevokeAPIKeyData }) => {
  if (!controller.isOpen) {
    return null;
  }

  return (
    <APIKeyModal
      handleOpen={controller.onOpen}
      handleClose={controller.handleClose}
      canCloseModal={false}
      modalRoot={controller.modalRoot}
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
            headerTitle={localizationKeys('apiKeys.revokeConfirmation.formTitle', {
              apiKeyName: controller.apiKeyName,
            })}
            headerSubtitle={localizationKeys('apiKeys.revokeConfirmation.formHint')}
          >
            <Form.Root onSubmit={controller.handleSubmit}>
              <Form.ControlRow
                elementId={controller.revokeField.id}
                elementDescriptor={descriptors.apiKeysRevokeModalInput}
              >
                <Form.PlainInput {...controller.revokeField.props} />
              </Form.ControlRow>
              <FormButtons
                submitLabel={localizationKeys('apiKeys.revokeConfirmation.formButtonPrimary__revoke')}
                colorScheme='danger'
                isDisabled={!controller.canSubmit}
                onReset={controller.handleClose}
                elementDescriptor={descriptors.apiKeysRevokeModalSubmitButton}
              />
            </Form.Root>
          </FormContainer>
        </Card.Content>
      </Card.Root>
    </APIKeyModal>
  );
};
