import { useUser } from '@clerk/shared/react';

import { Button, localizationKeys, Text } from '../../customizables';
import { ProfileSection } from '../../elements';
import { Action } from '../../elements/Action';
import { useActionContext } from '../../elements/Action/ActionRoot';
import { UsernameForm } from './UsernameForm';

const UsernameScreen = () => {
  const { close } = useActionContext();
  return (
    <UsernameForm
      onSuccess={close}
      onReset={close}
    />
  );
};

export const UsernameSection = () => {
  const { user } = useUser();

  if (!user) {
    return null;
  }

  return (
    <ProfileSection.Root
      title={localizationKeys('userProfile.start.usernameSection.title')}
      id='username'
    >
      <Action.Root>
        <Action.Closed value='edit'>
          <ProfileSection.Item id='username'>
            {user.username && <Text>{user.username}</Text>}

            <Action.Trigger value='edit'>
              <Button
                id='username'
                variant='ghostPrimary'
                localizationKey={
                  user.username
                    ? localizationKeys('userProfile.start.usernameSection.primaryButton__changeUsername')
                    : localizationKeys('userProfile.start.usernameSection.primaryButton__setUsername')
                }
              />
            </Action.Trigger>
          </ProfileSection.Item>
        </Action.Closed>

        <Action.Open value='edit'>
          <Action.Card>
            <UsernameScreen />
          </Action.Card>
        </Action.Open>
      </Action.Root>
    </ProfileSection.Root>
  );
};
