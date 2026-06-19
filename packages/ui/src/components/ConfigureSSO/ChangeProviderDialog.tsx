import { useId, useState } from 'react';

import type { LocalizationKey } from '@/customizables';
import { Button, Col, descriptors, Flex, Heading, localizationKeys, Text, useLocalizations } from '@/customizables';
import { Card } from '@/elements/Card';
import { useCardState, withCardStateProvider } from '@/elements/contexts';
import { Modal } from '@/elements/Modal';
import { Alert } from '@/ui/elements/Alert';
import { handleError } from '@/utils/errorHandler';

type ChangeProviderDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  /** Performs the provider change. Rejecting keeps the dialog open with the error shown inline. */
  onConfirm: () => Promise<unknown>;
  nextProviderLabel: LocalizationKey;
  currentProviderLabel: LocalizationKey;
  contentRef: React.RefObject<HTMLDivElement>;
};

export const ChangeProviderDialog = (props: ChangeProviderDialogProps): JSX.Element | null => {
  if (!props.isOpen) {
    return null;
  }

  return <ChangeProviderDialogContent {...props} />;
};

const ChangeProviderDialogContent = withCardStateProvider((props: ChangeProviderDialogProps) => {
  const { onClose, onConfirm, nextProviderLabel, currentProviderLabel, contentRef } = props;
  const { t } = useLocalizations();
  const card = useCardState();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const titleId = useId();

  const nextProvider = t(nextProviderLabel);
  const currentProvider = t(currentProviderLabel);

  const handleConfirm = async () => {
    card.setError(undefined);
    setIsSubmitting(true);

    try {
      // On success the wizard advances and unmounts this dialog; on failure we
      // surface the error inline and keep the dialog open so the user can retry.
      await onConfirm();
    } catch (err) {
      handleError(err as Error, [], card.setError);
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }
    onClose();
  };

  return (
    <Modal
      handleClose={onClose}
      canCloseModal={false}
      portalRoot={contentRef}
      aria-labelledby={titleId}
      onKeyDown={event => {
        if (event.key === 'Escape') {
          handleClose();
        }
      }}
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
      <Card.Root
        elementDescriptor={descriptors.configureSSOChangeProviderDialog}
        sx={t => ({ borderRadius: t.radii.$md })}
      >
        <Card.Content sx={t => ({ textAlign: 'start', padding: t.sizes.$5 })}>
          <Col sx={t => ({ gap: t.space.$4 })}>
            <Col sx={t => ({ gap: t.space.$2 })}>
              <Heading
                id={titleId}
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

            {card.error && (
              <Alert
                variant='danger'
                title={card.error}
              />
            )}

            <Flex
              justify='end'
              sx={t => ({ gap: t.space.$3 })}
            >
              <Button
                elementDescriptor={descriptors.configureSSOChangeProviderDialogCancelButton}
                variant='ghost'
                isDisabled={isSubmitting}
                onClick={handleClose}
                localizationKey={localizationKeys('configureSSO.changeProviderDialog.cancelButton')}
              />
              <Button
                elementDescriptor={descriptors.configureSSOChangeProviderDialogConfirmButton}
                variant='solid'
                isLoading={isSubmitting}
                onClick={() => void handleConfirm()}
                localizationKey={localizationKeys('configureSSO.changeProviderDialog.confirmButton')}
              />
            </Flex>
          </Col>
        </Card.Content>
      </Card.Root>
    </Modal>
  );
});
