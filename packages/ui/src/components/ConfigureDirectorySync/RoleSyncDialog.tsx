import { Button, descriptors, Flex, localizationKeys } from '@/customizables';
import { Card } from '@/elements/Card';
import { withCardStateProvider } from '@/elements/contexts';
import { Header } from '@/elements/Header';
import { Modal } from '@/elements/Modal';

type RoleSyncDialogProps = {
  action: 'enable' | 'disable';
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  contentRef?: React.RefObject<HTMLDivElement>;
};

export const RoleSyncDialog = (props: RoleSyncDialogProps): JSX.Element | null => {
  if (!props.isOpen) {
    return null;
  }

  return (
    <Modal
      handleClose={props.onClose}
      canCloseModal={false}
      portalRoot={props.contentRef}
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
      <RoleSyncDialogContent {...props} />
    </Modal>
  );
};

const RoleSyncDialogContent = withCardStateProvider(({ action, onClose, onConfirm }: RoleSyncDialogProps) => {
  const dialogKey = action === 'enable' ? 'enableDialog' : 'disableDialog';

  return (
    <Card.Root
      elementDescriptor={descriptors.configureDirectorySyncRoleSyncDialog}
      sx={t => ({ borderRadius: t.radii.$md })}
    >
      <Card.Content sx={t => ({ textAlign: 'start', padding: t.sizes.$5, gap: t.space.$4 })}>
        <Header.Root>
          <Header.Title
            textVariant='h3'
            localizationKey={localizationKeys(`configureDirectorySync.roleMappingStep.${dialogKey}.title`)}
          />
          <Header.Subtitle
            variant='body'
            localizationKey={localizationKeys(`configureDirectorySync.roleMappingStep.${dialogKey}.subtitle`)}
          />
        </Header.Root>
        <Flex
          justify='end'
          gap={2}
        >
          <Button
            elementDescriptor={descriptors.configureDirectorySyncRoleSyncDialogCancelButton}
            variant='ghost'
            colorScheme='neutral'
            size='sm'
            onClick={onClose}
            localizationKey={localizationKeys(`configureDirectorySync.roleMappingStep.${dialogKey}.cancelButton`)}
          />
          <Button
            elementDescriptor={descriptors.configureDirectorySyncRoleSyncDialogSubmitButton}
            colorScheme='danger'
            size='sm'
            onClick={() => {
              onConfirm();
              onClose();
            }}
            localizationKey={localizationKeys(`configureDirectorySync.roleMappingStep.${dialogKey}.confirmButton`)}
          />
        </Flex>
      </Card.Content>
    </Card.Root>
  );
});
