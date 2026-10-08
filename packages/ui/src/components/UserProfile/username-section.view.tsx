import { localizationKeys, Text } from '@/ui/customizables';
import { Action } from '@/ui/elements/Action';
import { ProfileSection } from '@/ui/elements/Section';
import { mqu } from '@/ui/styledSystem';

import type { UsernameSectionData } from './profile-sections.types';
import type { useProfileActionCloseController } from './useProfileActionCloseController';
import { UsernameForm } from './UsernameForm';

type ScreenController = ReturnType<typeof useProfileActionCloseController>;

export const UsernameScreenView = ({ controller }: { controller: ScreenController }) => (
  <UsernameForm
    onSuccess={controller.onSuccess}
    onReset={controller.onReset}
  />
);

export const UsernameSectionView = ({
  username,
  isImmutable,
  usernameScreen,
}: UsernameSectionData & {
  usernameScreen: React.ReactNode;
}) => (
  <ProfileSection.Root
    title={localizationKeys('userProfile.start.usernameSection.title')}
    id='username'
    sx={{ alignItems: 'center', [mqu.md]: { alignItems: 'flex-start' } }}
  >
    <Action.Root>
      <Action.Closed value='edit'>
        <ProfileSection.Item
          id='username'
          sx={{ paddingInlineStart: !username ? '0' : undefined }}
        >
          {username && (
            <Text
              truncate
              sx={t => ({ color: t.colors.$colorForeground })}
            >
              {username}
            </Text>
          )}

          {!isImmutable && (
            <Action.Trigger value='edit'>
              <ProfileSection.Button
                id='username'
                localizationKey={
                  username
                    ? localizationKeys('userProfile.start.usernameSection.primaryButton__updateUsername')
                    : localizationKeys('userProfile.start.usernameSection.primaryButton__setUsername')
                }
              />
            </Action.Trigger>
          )}
        </ProfileSection.Item>
      </Action.Closed>

      <Action.Open value='edit'>
        <Action.Card>{usernameScreen}</Action.Card>
      </Action.Open>
    </Action.Root>
  </ProfileSection.Root>
);
