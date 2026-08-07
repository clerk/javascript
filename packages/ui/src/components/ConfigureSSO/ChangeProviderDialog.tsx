import type { LocalizationKey } from '@/customizables';
import { Button, Col, descriptors, Flex, Heading, localizationKeys, Text, useLocalizations } from '@/customizables';
import { Card } from '@/elements/Card';
import { withCardStateProvider } from '@/elements/contexts';
import { Modal } from '@/elements/Modal';

type ChangeProviderDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
  nextProviderLabel: LocalizationKey;
  currentProviderLabel: LocalizationKey;
  contentRef: React.RefObject<HTMLDivElement>;
};

export const ChangeProviderDialog = (props: ChangeProviderDialogProps): JSX.Element | null => {
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
      <ChangeProviderDialogContent {...props} />
    </Modal>
  );
};

const ChangeProviderDialogContent = withCardStateProvider((props: ChangeProviderDialogProps) => {
  const { onClose, onConfirm, isSubmitting, nextProviderLabel, currentProviderLabel } = props;
  const { t } = useLocalizations();

  const nextProvider = t(nextProviderLabel);
  const currentProvider = t(currentProviderLabel);

  return (
    <Card.Root
      elementDescriptor={descriptors.configureSSOChangeProviderDialog}
      sx={t => ({ borderRadius: t.radii.$md })}
    >
      <Card.Content sx={t => ({ textAlign: 'start', padding: t.sizes.$5 })}>
        <Col sx={t => ({ gap: t.space.$4 })}>
          <Col sx={t => ({ gap: t.space.$2 })}>
            <Heading
              textVariant='h2'
              localizationKey={localizationKeys('configureSSO.changeProviderDialog.title', {
                provider: nextProvider,
              })}
              sx={t => ({ fontSize: t.fontSizes.$md })}
            />
            <Text
              as='p'
              colorScheme='secondary'
              localizationKey={localizationKeys('configureSSO.changeProviderDialog.subtitle', {
                provider: nextProvider,
                currentProvider,
              })}
            />
          </Col>

          <Flex
            justify='end'
            sx={t => ({ gap: t.space.$3 })}
          >
            <Button
              elementDescriptor={descriptors.configureSSOChangeProviderDialogCancelButton}
              variant='ghost'
              isDisabled={isSubmitting}
              onClick={onClose}
              localizationKey={localizationKeys('configureSSO.changeProviderDialog.cancelButton')}
            />
            <Button
              elementDescriptor={descriptors.configureSSOChangeProviderDialogConfirmButton}
              variant='solid'
              isLoading={isSubmitting}
              onClick={onConfirm}
              localizationKey={localizationKeys('configureSSO.changeProviderDialog.confirmButton')}
            />
          </Flex>
        </Col>
      </Card.Content>
    </Card.Root>
  );
});
