import type { ReactNode } from 'react';

import { Col, Flex, localizationKeys, Text } from '@/ui/customizables';
import { Action } from '@/ui/elements/Action';
import { Form } from '@/ui/elements/Form';
import { FormButtons } from '@/ui/elements/FormButtons';
import { FormContainer } from '@/ui/elements/FormContainer';
import { ProfileSection } from '@/ui/elements/Section';
import { ThreeDotsMenu } from '@/ui/elements/ThreeDotsMenu';
import { mqu } from '@/ui/styledSystem';

import type {
  useAddPasskeyController,
  usePasskeyItemController,
  usePasskeySectionController,
  useUpdatePasskeyController,
} from './passkey-section.controller';

export const UpdatePasskeyView = ({ controller }: { controller: ReturnType<typeof useUpdatePasskeyController> }) => (
  <FormContainer
    headerTitle={localizationKeys('userProfile.passkeyScreen.title__rename')}
    headerSubtitle={localizationKeys('userProfile.passkeyScreen.subtitle__rename')}
  >
    <Form.Root onSubmit={controller.renamePasskey}>
      <Form.ControlRow elementId={controller.passkeyNameField.id}>
        <Form.PlainInput
          {...controller.passkeyNameField.props}
          autoComplete={'off'}
        />
      </Form.ControlRow>
      <FormButtons
        submitLabel={localizationKeys('userProfile.formButtonPrimary__save')}
        isDisabled={!controller.canSubmit}
        onReset={controller.onReset}
      />
    </Form.Root>
  </FormContainer>
);

export const PasskeySectionView = ({
  controller,
  items,
  addButton,
}: {
  controller: ReturnType<typeof usePasskeySectionController>;
  items: ReactNode;
  addButton: ReactNode;
}) => (
  <ProfileSection.Root
    title={localizationKeys('userProfile.start.passkeysSection.title')}
    centered={false}
    id='passkeys'
  >
    <Action.Root
      value={controller.actionValue}
      onChange={controller.setActionValue}
    >
      <ProfileSection.ItemList id='passkeys'>
        {items}
        {addButton}
      </ProfileSection.ItemList>
    </Action.Root>
  </ProfileSection.Root>
);

export const PasskeyItemView = ({
  controller,
  removeScreen,
  renameScreen,
}: {
  controller: ReturnType<typeof usePasskeyItemController>;
  removeScreen: ReactNode;
  renameScreen: ReactNode;
}) => (
  <>
    <ProfileSection.Item
      id='passkeys'
      hoverable
      sx={{ alignItems: 'flex-start' }}
    >
      <Flex
        sx={t => ({
          width: '100%',
          overflow: 'hidden',
          gap: t.space.$4,
          [mqu.sm]: { gap: t.space.$2 },
        })}
      >
        <Col
          align='start'
          gap={1}
        >
          <Text>{controller.name}</Text>
          <Text colorScheme='secondary'>Created: {controller.createdAt}</Text>
          {controller.hasLastUsedAt && <Text colorScheme='secondary'>Last used: {controller.lastUsedAt}</Text>}
        </Col>
      </Flex>
      <ThreeDotsMenu actions={controller.actions} />
    </ProfileSection.Item>

    <Action.Open value={`remove-${controller.id}`}>
      <Action.Card variant='destructive'>{removeScreen}</Action.Card>
    </Action.Open>

    <Action.Open value={`rename-${controller.id}`}>
      <Action.Card>{renameScreen}</Action.Card>
    </Action.Open>
  </>
);

export const AddPasskeyButtonView = ({ controller }: { controller: ReturnType<typeof useAddPasskeyController> }) => {
  if (controller.isSatellite) {
    return null;
  }

  return (
    <ProfileSection.ArrowButton
      id='passkeys'
      localizationKey={localizationKeys('userProfile.start.passkeysSection.primaryButton')}
      onClick={controller.handleCreatePasskey}
      isLoading={controller.isLoading}
    />
  );
};
