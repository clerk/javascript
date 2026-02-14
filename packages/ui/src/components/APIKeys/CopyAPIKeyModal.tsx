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

import { APIKeyModal } from './APIKeyModal';

type CopyAPIKeyModalProps = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  apiKeyName: string;
  apiKeySecret: string;
  modalRoot?: React.MutableRefObject<HTMLElement | null>;
};

export const CopyAPIKeyModal = ({
  isOpen,
  onOpen,
  onClose,
  apiKeyName,
  apiKeySecret,
  modalRoot,
}: CopyAPIKeyModalProps) => {
  const apiKeyField = useFormControl('apiKeySecret', apiKeySecret, {
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
    <APIKeyModal
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
            textAlign: 'start',
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
                  {/* TODO: Use unified Input + Appended icon button component */}
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
    </APIKeyModal>
  );
};
