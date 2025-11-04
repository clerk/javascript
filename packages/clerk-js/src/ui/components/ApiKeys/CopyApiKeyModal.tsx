import { descriptors } from '@/ui/customizables';
import { useActionContext } from '@/ui/elements/Action/ActionRoot';
import { Card } from '@/ui/elements/Card';
import { ClipboardInput } from '@/ui/elements/ClipboardInput';
import { Form } from '@/ui/elements/Form';
import { FormButtons } from '@/ui/elements/FormButtons';
import { FormContainer } from '@/ui/elements/FormContainer';
import { useClipboard } from '@/ui/hooks';
import { Check, ClipboardOutline } from '@/ui/icons';
import { localizationKeys } from '@/ui/localization';
import { useFormControl } from '@/ui/utils/useFormControl';

import { ApiKeyModal } from './ApiKeyModal';

type CopyApiKeyModalProps = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  apiKeyName: string;
  apiKeySecret: string;
  modalRoot?: React.MutableRefObject<HTMLElement | null>;
};

export const CopyApiKeyModal = ({
  isOpen,
  onOpen,
  onClose,
  apiKeyName,
  apiKeySecret,
  modalRoot,
}: CopyApiKeyModalProps) => {
  const apiKeyField = useFormControl('name', apiKeySecret, {
    type: 'text',
    label: localizationKeys('formFieldLabel__apiKey'),
    isRequired: false,
  });

  const { onCopy } = useClipboard(apiKeySecret);
  const { close: closeActionCard } = useActionContext();

  const handleSubmit = () => {
    onCopy();
    onClose();
    setTimeout(() => {
      closeActionCard();
    }, 100);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <ApiKeyModal
      handleOpen={onOpen}
      handleClose={onClose}
      canCloseModal={false}
      modalRoot={modalRoot}
    >
      <Card.Root
        role='alertdialog'
        elementDescriptor={descriptors.apiKeysCopyModal}
      >
        <Card.Content
          sx={t => ({
            textAlign: 'left',
            padding: `${t.sizes.$4} ${t.sizes.$5} ${t.sizes.$4} ${t.sizes.$6}`,
          })}
        >
          <FormContainer
            headerTitle={localizationKeys('apiKeys.copySecret.formTitle', { name: apiKeyName })}
            headerSubtitle={localizationKeys('apiKeys.copySecret.formHint')}
          >
            <Form.Root onSubmit={handleSubmit}>
              <Form.ControlRow
                elementDescriptor={descriptors.apiKeysCopyModalInput}
                sx={{ flex: 1 }}
              >
                <Form.CommonInputWrapper {...apiKeyField.props}>
                  <ClipboardInput
                    value={apiKeySecret}
                    readOnly
                    sx={{ width: '100%' }}
                    copyIcon={ClipboardOutline}
                    copiedIcon={Check}
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
    </ApiKeyModal>
  );
};
