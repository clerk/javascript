import { useUser } from '@clerk/shared/react';

import { useEnvironment } from '@/ui/contexts';
import { ProfileSection } from '@/ui/elements/Section';

import { localizationKeys, Text } from '../../customizables';
import { Action } from '../../elements/Action';
import { useActionContext } from '../../elements/Action/ActionRoot';
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
  const { userSettings } = useEnvironment();

  if (!user) {
    return null;
  }

  // First check: Are passwords globally enabled in this app?
  const passwordsGloballyEnabled = userSettings.attributes.password?.enabled;

  if (!passwordsGloballyEnabled) {
    return null; // Don't show password section at all
  }

  // Second check: Does this user have a password set?
  const { passwordEnabled } = user;

  return (
    <ProfileSection.Root
      centered={false}
      title={localizationKeys('userProfile.start.passwordSection.title')}
      id='password'
    >
      <Action.Root>
        <Action.Closed value='edit'>
          <ProfileSection.Item
            id='password'
            sx={t => ({
              paddingLeft: !passwordEnabled ? '0' : undefined,
              paddingTop: t.space.$0x25,
              paddingBottom: t.space.$0x25,
            })}
          >
            {passwordEnabled && <Text variant='h2'>••••••••••</Text>}

            <Action.Trigger value='edit'>
              <ProfileSection.Button
                id='password'
                localizationKey={
                  passwordEnabled
                    ? localizationKeys('userProfile.start.passwordSection.primaryButton__updatePassword')
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
