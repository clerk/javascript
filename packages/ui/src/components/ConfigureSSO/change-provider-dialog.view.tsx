import { Button, Col, descriptors, Flex, Heading, localizationKeys, Text } from '@/customizables';
import { Card } from '@/elements/Card';

import type { useChangeProviderDialogModel } from './change-provider-dialog.model';

export const ChangeProviderDialogContentView = ({
  onClose,
  onConfirm,
  isSubmitting,
  connectionName,
  nextProvider,
  currentProvider,
}: {
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
  connectionName: string;
} & ReturnType<typeof useChangeProviderDialogModel>): JSX.Element => {
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
                name: connectionName,
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
};
