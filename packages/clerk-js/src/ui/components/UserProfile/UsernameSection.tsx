import { useUser } from '@clerk/shared/react';

import { Button, Flex, localizationKeys, Text } from '../../customizables';
import { ProfileSection } from '../../elements';
import { Action } from '../../elements/Action';
import { UsernameForm } from './UsernameForm';

export const UsernameSection = () => {
  const { user } = useUser();

  if (!user) {
    return null;
  }

  return (
    <ProfileSection
      title={localizationKeys('userProfile.start.usernameSection.title')}
      id='username'
    >
      <Action.Root>
        <Action.Closed value='edit'>
          <Flex
            sx={{
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {user.username && <Text sx={t => ({ padding: `${t.space.$2} ${t.space.$4}` })}>{user.username}</Text>}

            <Action.Trigger value='edit'>
              <Button
                id='username'
                variant='ghost'
                localizationKey={
                  user.username
                    ? localizationKeys('userProfile.start.usernameSection.primaryButton__changeUsername')
                    : localizationKeys('userProfile.start.usernameSection.primaryButton__setUsername')
                }
              />
            </Action.Trigger>
          </Flex>
        </Action.Closed>

        <Action.Open value='edit'>
          <Action.Card>
            <UsernameForm />
          </Action.Card>
        </Action.Open>
      </Action.Root>
    </ProfileSection>
  );
};
