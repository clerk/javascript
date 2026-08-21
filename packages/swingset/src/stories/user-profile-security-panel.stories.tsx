import { UserProfileSecurityPanelView } from '@clerk/ui/mosaic/user-profile/user-profile-security-panel.view';

import type { StoryMeta } from '@/lib/types';

import { DEFAULT_SECURITY_FLOW_CONFIG } from './user-profile-security-panel-flow.config';
import { useUserProfileSecurityPanelMockController } from './user-profile-security-panel-flow.controller';

export { default as __source } from './user-profile-security-panel.stories?raw';

export const meta: StoryMeta = {
  group: 'User Profile',
  title: 'UserProfileSecurityPanel',
  label: 'Security panel',
  navigation: { category: 'Panels' },
  source: 'packages/ui/src/mosaic/user-profile/user-profile-security-panel.view.tsx',
};

export function Default() {
  const controller = useUserProfileSecurityPanelMockController({
    config: { ...DEFAULT_SECURITY_FLOW_CONFIG, hasBackupCodes: true, hasMfaPhone: true },
  });

  return <UserProfileSecurityPanelView {...controller} />;
}
