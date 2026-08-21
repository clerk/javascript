import { SecurityPanelDialogsView } from '@clerk/ui/mosaic/user-profile/dialogs/security-panel-dialogs.view';
import { UserProfileDeleteSectionView } from '@clerk/ui/mosaic/user-profile/user-profile-delete-section.view';

import type { StoryMeta } from '@/lib/types';

import { useUserProfileSecurityPanelMockController } from './user-profile-security-panel-flow.controller';

export { default as __source } from './user-profile-delete-section.stories?raw';

export const meta: StoryMeta = {
  group: 'User Profile',
  title: 'UserProfileDeleteSection',
  label: 'Danger zone',
  navigation: { category: 'Sections' },
  source: 'packages/ui/src/mosaic/user-profile/user-profile-delete-section.view.tsx',
};

export function Default() {
  const controller = useUserProfileSecurityPanelMockController();

  return (
    <>
      <UserProfileDeleteSectionView onDelete={() => controller.onDeleteAccount?.()} />
      <SecurityPanelDialogsView {...controller} />
    </>
  );
}
