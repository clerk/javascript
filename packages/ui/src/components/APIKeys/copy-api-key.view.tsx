import { descriptors } from '@/ui/customizables';
import { Card } from '@/ui/elements/Card';
import { ClipboardInput } from '@/ui/elements/ClipboardInput';
import { Form } from '@/ui/elements/Form';
import { FormButtons } from '@/ui/elements/FormButtons';
import { FormContainer } from '@/ui/elements/FormContainer';
import { Checkmark, Clipboard } from '@/ui/icons';
import { localizationKeys } from '@/ui/localization';

import type { CopyAPIKeyData } from './api-keys.types';
import { APIKeyModal } from './APIKeyModal';

export const CopyAPIKeyView = ({ controller }: { controller: CopyAPIKeyData }) => {
  if (!controller.isOpen) {
    return null;
  }

  return (
    <APIKeyModal
      handleOpen={controller.onOpen}
      handleClose={controller.onClose}
      canCloseModal={false}
      modalRoot={controller.modalRoot}
    >
      <Card.Root
        role='alertdialog'
        elementDescriptor={descriptors.apiKeysCopyModal}
      >
        <Card.Content
          sx={t => ({
            textAlign: 'start',
            padding: `${t.sizes.$4} ${t.sizes.$5} ${t.sizes.$4} ${t.sizes.$6}`,
          })}
        >
          <FormContainer
            headerTitle={localizationKeys('apiKeys.copySecret.formTitle', { name: controller.apiKeyName })}
            headerSubtitle={localizationKeys('apiKeys.copySecret.formHint')}
          >
            <Form.Root onSubmit={controller.handleSubmit}>
              <Form.ControlRow
                elementDescriptor={descriptors.apiKeysCopyModalInput}
                sx={{ flex: 1 }}
              >
                <Form.CommonInputWrapper {...controller.apiKeyFieldProps}>
                  {/* TODO: Use unified Input + Appended icon button component */}
                  <ClipboardInput
                    value={controller.apiKeySecret}
                    readOnly
                    sx={{ width: '100%' }}
                    copyIcon={Clipboard}
                    copiedIcon={Checkmark}
                  />
                </Form.CommonInputWrapper>
              </Form.ControlRow>
              <FormButtons
                submitLabel={localizationKeys('apiKeys.copySecret.formButtonPrimary__copyAndClose')}
                hideReset
                elementDescriptor={descriptors.apiKeysCopyModalSubmitButton}
              />
            </Form.Root>
          </FormContainer>
        </Card.Content>
      </Card.Root>
    </APIKeyModal>
  );
};
