import { SecurityPanelDialogsView } from '@clerk/ui/mosaic/user-profile/dialogs/security-panel-dialogs.view';
import { UserProfilePasswordSectionView } from '@clerk/ui/mosaic/user-profile/user-profile-password-section.view';

import type { StoryMeta } from '@/lib/types';

import { COMPOSED_SECURITY_FLOW_CONFIG } from './user-profile-security-panel-flow.config';
import { useUserProfileSecurityPanelMockController } from './user-profile-security-panel-flow.controller';

export { default as __source } from './user-profile-password-section.stories?raw';

export const meta: StoryMeta = {
  group: 'User Profile',
  title: 'UserProfilePasswordSection',
  label: 'Password',
  navigation: { category: 'Sections' },
  source: 'packages/ui/src/mosaic/user-profile/user-profile-password-section.view.tsx',
};

export function Default() {
  const controller = useUserProfileSecurityPanelMockController({
    config: COMPOSED_SECURITY_FLOW_CONFIG,
  });

  return (
    <>
      <UserProfilePasswordSectionView
        hasPassword={controller.hasPassword}
        onChangePassword={controller.onChangePassword}
      />
      <SecurityPanelDialogsView {...controller} />
    </>
  );
}
