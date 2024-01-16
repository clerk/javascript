import { useUser } from '@clerk/shared/react';

import { Button, localizationKeys, Text } from '../../customizables';
import { ProfileSection } from '../../elements';
import { Action } from '../../elements/Action';
import { useActionContext } from '../../elements/Action/ActionRoot';
import { mqu } from '../../styledSystem';
import { PasswordForm } from './PasswordForm';

const PasswordScreen = () => {
  const { close } = useActionContext();
  return (
    <PasswordForm
      onSuccess={close}
      onReset={close}
    />
  );
};

export const PasswordSection = () => {
  const { user } = useUser();

  if (!user) {
    return null;
  }

  const { passwordEnabled } = user;

  return (
    <ProfileSection.Root
      title={localizationKeys('userProfile.start.passwordSection.title')}
      id='password'
      sx={{ alignItems: 'center', [mqu.md]: { alignItems: 'flex-start' } }}
    >
      <Action.Root>
        <Action.Closed value='edit'>
          <ProfileSection.Item
            id='password'
            sx={t => ({
              padding: `${t.space.$1x5} ${t.space.$none} ${t.space.$1x5} ${t.space.$3}`,
            })}
          >
            {passwordEnabled && <Text sx={t => ({ fontSize: t.fontSizes.$xl })}>••••••••••</Text>}

            <Action.Trigger value='edit'>
              <Button
                id='password'
                variant='ghost'
                textVariant='buttonSmall'
                localizationKey={
                  passwordEnabled
                    ? localizationKeys('userProfile.start.passwordSection.primaryButton__changePassword')
                    : localizationKeys('userProfile.start.passwordSection.primaryButton__setPassword')
                }
              />
            </Action.Trigger>
          </ProfileSection.Item>
        </Action.Closed>

        <Action.Open value='edit'>
          <Action.Card>
            <PasswordScreen />
          </Action.Card>
        </Action.Open>
      </Action.Root>
    </ProfileSection.Root>
  );
};
