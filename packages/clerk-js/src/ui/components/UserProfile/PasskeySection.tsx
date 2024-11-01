import { __experimental_useReverification as useReverification, useClerk, useUser } from '@clerk/shared/react';
import type { PasskeyResource } from '@clerk/types';
import React from 'react';

import { Col, Flex, localizationKeys, Text, useLocalizations } from '../../customizables';
import {
  Form,
  FormButtons,
  FormContainer,
  type FormProps,
  ProfileSection,
  ThreeDotsMenu,
  useCardState,
  withCardStateProvider,
} from '../../elements';
import { Action } from '../../elements/Action';
import { useActionContext } from '../../elements/Action/ActionRoot';
import type { PropsOfComponent } from '../../styledSystem';
import { mqu } from '../../styledSystem';
import { getRelativeToNowDateKey, handleError, useFormControl } from '../../utils';
import { RemovePasskeyForm } from './RemoveResourceForm';

const RemovePasskeyScreen = (props: PasskeyScreenProps) => {
  const { close } = useActionContext();
  return (
    <RemovePasskeyForm
      onSuccess={close}
      onReset={close}
      {...props}
    />
  );
};

type PasskeyScreenProps = { passkey: PasskeyResource };

type UpdatePasskeyFormProps = FormProps & PasskeyScreenProps;
const PasskeyScreen = (props: PasskeyScreenProps) => {
  const { close } = useActionContext();
  return (
    <UpdatePasskeyForm
      onSuccess={close}
      onReset={close}
      passkey={props.passkey}
    />
  );
};

export const UpdatePasskeyForm = withCardStateProvider((props: UpdatePasskeyFormProps) => {
  const { onSuccess, onReset, passkey } = props;
  const card = useCardState();

  const passkeyNameField = useFormControl('passkeyName', passkey.name || '', {
    type: 'text',
    label: localizationKeys('formFieldLabel__passkeyName'),
    isRequired: true,
  });

  const canSubmit = passkeyNameField.value.length > 1 && passkey.name !== passkeyNameField.value;

  const addEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    return passkey
      .update({ name: passkeyNameField.value })
      .then(onSuccess)
      .catch(e => handleError(e, [passkeyNameField], card.setError));
  };

  return (
    <FormContainer
      headerTitle={localizationKeys('userProfile.passkeyScreen.title__rename')}
      headerSubtitle={localizationKeys('userProfile.passkeyScreen.subtitle__rename')}
    >
      <Form.Root onSubmit={addEmail}>
        <Form.ControlRow elementId={passkeyNameField.id}>
          <Form.PlainInput
            {...passkeyNameField.props}
            autoComplete={'off'}
          />
        </Form.ControlRow>
        <FormButtons
          submitLabel={localizationKeys('userProfile.formButtonPrimary__save')}
          isDisabled={!canSubmit}
          onReset={onReset}
        />
      </Form.Root>
    </FormContainer>
  );
});

export const PasskeySection = () => {
  const { user } = useUser();

  if (!user) {
    return null;
  }

  return (
    <ProfileSection.Root
      title={localizationKeys('userProfile.start.passkeysSection.title')}
      centered={false}
      id='passkeys'
    >
      <ProfileSection.ItemList id='passkeys'>
        {user.passkeys.map(passkey => (
          <Action.Root key={passkey.id}>
            <PasskeyItem
              key={passkey.id}
              {...passkey}
            />

            <Action.Open value='remove'>
              <Action.Card variant='destructive'>
                <RemovePasskeyScreen passkey={passkey} />
              </Action.Card>
            </Action.Open>

            <Action.Open value='rename'>
              <Action.Card>
                <PasskeyScreen passkey={passkey} />
              </Action.Card>
            </Action.Open>
          </Action.Root>
        ))}

        <AddPasskeyButton />
      </ProfileSection.ItemList>
    </ProfileSection.Root>
  );
};

const PasskeyItem = (props: PasskeyResource) => {
  return (
    <ProfileSection.Item
      id='passkeys'
      hoverable
      sx={{
        alignItems: 'flex-start',
      }}
    >
      <PasskeyInfo {...props} />
      <ActiveDeviceMenu />
    </ProfileSection.Item>
  );
};

const PasskeyInfo = (props: PasskeyResource) => {
  const { name, createdAt, lastUsedAt } = props;
  const { t } = useLocalizations();

  return (
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
        <Text>{name}</Text>
        <Text colorScheme='secondary'>Created: {t(getRelativeToNowDateKey(createdAt))}</Text>
        {lastUsedAt && <Text colorScheme='secondary'>Last used: {t(getRelativeToNowDateKey(lastUsedAt))}</Text>}
      </Col>
    </Flex>
  );
};

const ActiveDeviceMenu = () => {
  const { open } = useActionContext();

  const actions = [
    {
      label: localizationKeys('userProfile.start.passkeysSection.menuAction__rename'),
      onClick: () => open('rename'),
    },
    {
      label: localizationKeys('userProfile.start.passkeysSection.menuAction__destructive'),
      isDestructive: true,
      onClick: () => open('remove'),
    },
  ] satisfies PropsOfComponent<typeof ThreeDotsMenu>['actions'];

  return <ThreeDotsMenu actions={actions} />;
};

// TODO-PASSKEYS: Should the error be scope to the section ?
const AddPasskeyButton = () => {
  const card = useCardState();
  const { isSatellite } = useClerk();
  const { user } = useUser();
  const [createPasskey] = useReverification(() => {
    if (!user) {
      return Promise.resolve(undefined);
    }
    return user.createPasskey();
  });

  const handleCreatePasskey = async () => {
    if (!user) {
      return;
    }
    try {
      await createPasskey();
    } catch (e) {
      handleError(e, [], card.setError);
    }
  };

  if (isSatellite) {
    return null;
  }

  return (
    <ProfileSection.ArrowButton
      id='passkeys'
      localizationKey={'Add a passkey'}
      onClick={handleCreatePasskey}
    />
  );
};
