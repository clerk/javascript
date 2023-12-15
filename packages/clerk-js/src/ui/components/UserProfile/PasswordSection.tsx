import { useUser } from '@clerk/shared/react';

import { Button, Flex, localizationKeys, Text } from '../../customizables';
import { ProfileSection } from '../../elements';
import { Action } from '../../elements/Action';
import { PasswordForm } from './PasswordForm';

export const PasswordSection = () => {
  const { user } = useUser();

  if (!user) {
    return null;
  }

  const { passwordEnabled } = user;

  return (
    <ProfileSection
      title={localizationKeys('userProfile.start.passwordSection.title')}
      id='password'
    >
      <Action.Root>
        <Action.Closed value='edit'>
          <Flex
            sx={{
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {passwordEnabled && <Text sx={t => ({ padding: `${t.space.$2} ${t.space.$4}` })}>••••••••••</Text>}

            <Action.Trigger value='edit'>
              <Button
                id='password'
                variant='ghost'
                localizationKey={
                  passwordEnabled
                    ? localizationKeys('userProfile.start.passwordSection.primaryButton__changePassword')
                    : localizationKeys('userProfile.start.passwordSection.primaryButton__setPassword')
                }
              />
            </Action.Trigger>
          </Flex>
        </Action.Closed>

        <Action.Open value='edit'>
          <Action.Card>
            <PasswordForm />
          </Action.Card>
        </Action.Open>
      </Action.Root>
    </ProfileSection>
  );
};
