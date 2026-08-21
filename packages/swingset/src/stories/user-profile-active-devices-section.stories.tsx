import { SecurityPanelDialogsView } from '@clerk/ui/mosaic/user-profile/dialogs/security-panel-dialogs.view';
import { UserProfileActiveDevicesSectionView } from '@clerk/ui/mosaic/user-profile/user-profile-active-devices-section.view';

import type { StoryMeta } from '@/lib/types';

import { useUserProfileSecurityPanelMockController } from './user-profile-security-panel-flow.controller';

export { default as __source } from './user-profile-active-devices-section.stories?raw';

export const meta: StoryMeta = {
  group: 'User Profile',
  title: 'UserProfileActiveDevicesSection',
  label: 'Active devices',
  navigation: { category: 'Sections' },
  source: 'packages/ui/src/mosaic/user-profile/user-profile-active-devices-section.view.tsx',
};

export function Default() {
  const controller = useUserProfileSecurityPanelMockController();

  return (
    <>
      <UserProfileActiveDevicesSectionView
        devices={controller.devices ?? []}
        error={controller.devicesError}
        signOutState={controller.deviceSignOutState}
        status={controller.devicesStatus}
        onManageDevice={controller.onManageDevice}
        onSignOutAllOtherDevices={controller.onSignOutAllOtherDevices}
        onSignOutDevice={controller.onSignOutDevice}
      />
      <SecurityPanelDialogsView {...controller} />
    </>
  );
}
