import { descriptors } from '@/ui/customizables';
import { Card } from '@/ui/elements/Card';
import { ClipboardInput } from '@/ui/elements/ClipboardInput';
import { Form } from '@/ui/elements/Form';
import { FormButtons } from '@/ui/elements/FormButtons';
import { FormContainer } from '@/ui/elements/FormContainer';
import { Modal } from '@/ui/elements/Modal';
import { Check, ClipboardOutline } from '@/ui/icons';
import { localizationKeys } from '@/ui/localization';

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
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
  };

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
              borderRadius: t.radii.$lg,
            })
          : {},
      ]}
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
                <ClipboardInput
                  value={apiKeySecret}
                  readOnly
                  sx={{ width: '100%' }}
                  copyIcon={ClipboardOutline}
                  copiedIcon={Check}
                />
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
    </Modal>
  );
};
