import { localizationKeys, Text } from '@/ui/customizables';
import { Action } from '@/ui/elements/Action';
import { ProfileSection } from '@/ui/elements/Section';

import { PasswordForm } from './PasswordForm';
import type { PasswordSectionData } from './profile-sections.types';
import type { useProfileActionCloseController } from './useProfileActionCloseController';

type ScreenController = ReturnType<typeof useProfileActionCloseController>;

export const PasswordScreenView = ({ controller }: { controller: ScreenController }) => (
  <PasswordForm
    onSuccess={controller.onSuccess}
    onReset={controller.onReset}
  />
);

export const PasswordSectionView = ({
  passwordEnabled,
  passwordScreen,
}: PasswordSectionData & {
  passwordScreen: React.ReactNode;
}) => (
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
            paddingInlineStart: !passwordEnabled ? '0' : undefined,
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
        <Action.Card>{passwordScreen}</Action.Card>
      </Action.Open>
    </Action.Root>
  </ProfileSection.Root>
);
