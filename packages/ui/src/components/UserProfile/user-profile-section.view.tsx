import { localizationKeys } from '@/ui/customizables';
import { Action } from '@/ui/elements/Action';
import { ProfileSection } from '@/ui/elements/Section';
import { UserPreviewView } from '@/ui/elements/user-preview.view';
import { mqu } from '@/ui/styledSystem';

import type { UserProfileSectionData } from './profile-sections.types';
import { ProfileForm } from './ProfileForm';
import type { useProfileActionCloseController } from './useProfileActionCloseController';

type ScreenController = ReturnType<typeof useProfileActionCloseController>;

export const ProfileScreenView = ({ controller }: { controller: ScreenController }) => (
  <ProfileForm
    onSuccess={controller.onSuccess}
    onReset={controller.onReset}
  />
);

export const UserProfileSectionView = ({
  preview,
  profileScreen,
}: UserProfileSectionData & {
  profileScreen: React.ReactNode;
}) => (
  <ProfileSection.Root
    title={localizationKeys('userProfile.start.profileSection.title')}
    id='profile'
    sx={{ [mqu.md]: { alignItems: 'flex-start' } }}
  >
    <Action.Root>
      <Action.Closed value='edit'>
        <ProfileSection.Item id='profile'>
          <UserPreviewView
            {...preview}
            size='lg'
            mainIdentifierVariant='subtitle'
            sx={t => ({ color: t.colors.$colorForeground })}
          />

          <Action.Trigger value='edit'>
            <ProfileSection.Button
              id='profile'
              localizationKey={localizationKeys('userProfile.start.profileSection.primaryButton')}
            />
          </Action.Trigger>
        </ProfileSection.Item>
      </Action.Closed>

      <Action.Open value='edit'>
        <Action.Card>{profileScreen}</Action.Card>
      </Action.Open>
    </Action.Root>
  </ProfileSection.Root>
);
