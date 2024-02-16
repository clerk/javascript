import { useUser } from '@clerk/shared/react';
import React from 'react';

import {
  Form,
  FormButtons,
  FormContainer,
  type FormProps,
  ProfileSection,
  useCardState,
  withCardStateProvider,
} from '../../elements';
import { Action } from '../../elements/Action';
import { useActionContext } from '../../elements/Action/ActionRoot';
import { handleError } from '../../utils';

export const PasskeysForm = withCardStateProvider((props: FormProps) => {
  const card = useCardState();
  const { user } = useUser();

  const addPasskey = async (e: React.FormEvent) => {
    e.preventDefault();
    return user
      ?.createPasskey()
      .then(() => props.onSuccess())
      .catch(e => handleError(e, [], card.setError));
  };

  return (
    <FormContainer headerTitle={'Add passkey'}>
      <Form.Root onSubmit={addPasskey}>
        <FormButtons
          onReset={props.onReset}
          localizationKey={'Create'}
        />
      </Form.Root>
    </FormContainer>
  );
});

type EmailScreenProps = { emailId?: string };
const AddPasskeyScreen = (props: EmailScreenProps) => {
  const { close } = useActionContext();
  return (
    <PasskeysForm
      onSuccess={close}
      onReset={close}
      {...props}
    />
  );
};

export const PasskeysSection = () => {
  return (
    <ProfileSection.Root
      // @ts-ignore
      title={'Passkeys'}
      centered={false}
      id='passkeys'
    >
      <Action.Root>
        <ProfileSection.ItemList id='emailAddresses'>
          <Action.Trigger value='add'>
            <ProfileSection.ArrowButton
              id='emailAddresses'
              localizationKey={'Add passkey'}
            />
          </Action.Trigger>

          <Action.Open value='add'>
            <Action.Card>
              <AddPasskeyScreen />
            </Action.Card>
          </Action.Open>
        </ProfileSection.ItemList>
      </Action.Root>
    </ProfileSection.Root>
  );
};
