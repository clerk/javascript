import { useUser } from '@clerk/shared/react';
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
          submitLabel={localizationKeys('userProfile.formButtonPrimary__add')}
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
      <Action.Root>
        <ProfileSection.ItemList id='passkeys'>
          {user.__experimental_passkeys.map(passkey => (
            <Action.Root key={passkey.id}>
              <PasskeyItem
                key={passkey.id}
                {...passkey}
              />

              {/*// TODO-PASSKEYS: Implement*/}
              <Action.Open value='remove'>
                <Action.Card variant='destructive'>{/*<RemoveEmailScreen emailId={email.id} />*/}</Action.Card>
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
      </Action.Root>
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
      <ActiveDeviceMenu revoke={props.delete} />
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
        <Text colorScheme='neutral'>Created: {t(getRelativeToNowDateKey(createdAt))}</Text>
        {lastUsedAt && <Text colorScheme='neutral'>Last used: {t(getRelativeToNowDateKey(lastUsedAt))}</Text>}
      </Col>
    </Flex>
  );
};

const ActiveDeviceMenu = ({ revoke }: { revoke: () => Promise<any> }) => {
  const { open } = useActionContext();
  const actions = (
    [
      {
        label: localizationKeys('userProfile.start.passkeysSection.menuAction__rename'),
        onClick: () => open('rename'),
      },

      {
        label: localizationKeys('userProfile.start.passkeysSection.menuAction__destructive'),
        isDestructive: true,
        onClick: revoke,
      },
    ] satisfies (PropsOfComponent<typeof ThreeDotsMenu>['actions'][0] | null)[]
  ).filter(a => a !== null) as PropsOfComponent<typeof ThreeDotsMenu>['actions'];

  return <ThreeDotsMenu actions={actions} />;
};

// TODO-PASSKEYS: Should the error be scope to the section ?
const AddPasskeyButton = () => {
  const card = useCardState();
  const { user } = useUser();

  const handleCreatePasskey = async () => {
    try {
      await user?.__experimental_createPasskey();
    } catch (e) {
      handleError(e, [], card.setError);
    }
  };

  return (
    <ProfileSection.ArrowButton
      id='passkeys'
      localizationKey={'Add a passkey'}
      onClick={handleCreatePasskey}
    />
  );
};
