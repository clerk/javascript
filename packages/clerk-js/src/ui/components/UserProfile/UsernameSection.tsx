import { useUser } from '@clerk/shared/react';

import { Button, localizationKeys, Text } from '../../customizables';
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
          <ProfileSection.Item
            id='username'
            sx={t => ({
              padding: `${t.space.$1x5} ${t.space.$none} ${t.space.$1x5} ${t.space.$3}`,
            })}
          >
            {user.username && <Text sx={t => ({ color: t.colors.$blackAlpha700 })}>{user.username}</Text>}

            <Action.Trigger value='edit'>
              <Button
                id='username'
                variant='ghost'
                textVariant='buttonSmall'
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
