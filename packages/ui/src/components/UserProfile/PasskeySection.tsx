import { useClerk, useReverification, useUser } from '@clerk/shared/react';
import type { PasskeyResource } from '@clerk/shared/types';
import React, { Fragment, useState } from 'react';

import { useCardState, withCardStateProvider } from '@/ui/elements/contexts';
import { Form } from '@/ui/elements/Form';
import { FormButtons } from '@/ui/elements/FormButtons';
import type { FormProps } from '@/ui/elements/FormContainer';
import { FormContainer } from '@/ui/elements/FormContainer';
import { ProfileSection } from '@/ui/elements/Section';
import { ThreeDotsMenu } from '@/ui/elements/ThreeDotsMenu';
import { handleError } from '@/ui/utils/errorHandler';
import { getRelativeToNowDateKey } from '@/ui/utils/getRelativeToNowDateKey';
import { useFormControl } from '@/ui/utils/useFormControl';

import { Col, Flex, localizationKeys, Text, useLocalizations } from '../../customizables';
import { Action } from '../../elements/Action';
import { useActionContext } from '../../elements/Action/ActionRoot';
import type { PropsOfComponent } from '../../styledSystem';
import { mqu } from '../../styledSystem';
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
  const [actionValue, setActionValue] = useState<string | null>(null);

  if (!user) {
    return null;
  }

  return (
    <ProfileSection.Root
      title={localizationKeys('userProfile.start.passkeysSection.title')}
      centered={false}
      id='passkeys'
    >
      <Action.Root
        value={actionValue}
        onChange={setActionValue}
      >
        <ProfileSection.ItemList id='passkeys'>
          {user.passkeys.map(passkey => {
            const passkeyId = passkey.id;
            return (
              <Fragment key={passkeyId}>
                <PasskeyItem
                  key={passkeyId}
                  {...passkey}
                />

                <Action.Open value={`remove-${passkeyId}`}>
                  <Action.Card variant='destructive'>
                    <RemovePasskeyScreen passkey={passkey} />
                  </Action.Card>
                </Action.Open>

                <Action.Open value={`rename-${passkeyId}`}>
                  <Action.Card>
                    <PasskeyScreen passkey={passkey} />
                  </Action.Card>
                </Action.Open>
              </Fragment>
            );
          })}

          <AddPasskeyButton onClick={() => setActionValue(null)} />
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
      <ActiveDeviceMenu passkey={props} />
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

const ActiveDeviceMenu = ({ passkey }: { passkey: PasskeyResource }) => {
  const { open } = useActionContext();
  const passkeyId = passkey.id;

  const actions = [
    {
      label: localizationKeys('userProfile.start.passkeysSection.menuAction__rename'),
      onClick: () => open(`rename-${passkeyId}`),
    },
    {
      label: localizationKeys('userProfile.start.passkeysSection.menuAction__destructive'),
      isDestructive: true,
      onClick: () => open(`remove-${passkeyId}`),
    },
  ] satisfies PropsOfComponent<typeof ThreeDotsMenu>['actions'];

  return <ThreeDotsMenu actions={actions} />;
};

// TODO-PASSKEYS: Should the error be scope to the section ?
const AddPasskeyButton = ({ onClick }: { onClick?: () => void }) => {
  const card = useCardState();
  const { isSatellite } = useClerk();
  const { user } = useUser();
  const createPasskey = useReverification(() => user?.createPasskey());

  const handleCreatePasskey = async () => {
    onClick?.();
    if (!user) {
      return;
    }
    try {
      await createPasskey();
    } catch (e: any) {
      handleError(e, [], card.setError);
    }
  };

  if (isSatellite) {
    return null;
  }

  return (
    <ProfileSection.ArrowButton
      id='passkeys'
      localizationKey={localizationKeys('userProfile.start.passkeysSection.primaryButton')}
      onClick={handleCreatePasskey}
    />
  );
};
