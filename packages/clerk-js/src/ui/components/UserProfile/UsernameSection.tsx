import { useUser } from '@clerk/shared/react';

import { localizationKeys, Text } from '../../customizables';
import { ProfileSection } from '../../elements';
import { Action } from '../../elements/Action';
import { useActionContext } from '../../elements/Action/ActionRoot';
import { mqu } from '../../styledSystem';
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
      sx={{ alignItems: 'center', [mqu.md]: { alignItems: 'flex-start' } }}
    >
      <Action.Root>
        <Action.Closed value='edit'>
          <ProfileSection.Item id='username'>
            {user.username && (
              <Text
                truncate
                sx={t => ({ color: t.colors.$blackAlpha700 })}
              >
                {user.username}
              </Text>
            )}

            <Action.Trigger value='edit'>
              <ProfileSection.Button
                id='username'
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
