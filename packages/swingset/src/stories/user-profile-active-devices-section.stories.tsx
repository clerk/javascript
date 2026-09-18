import { UserProfileActiveDevicesSectionView } from '@clerk/mosaic/features/user-profile/user-profile-active-devices-section.view';

import type { StoryMeta } from '@/lib/types';

import {
  userProfileImpersonationDevices,
  useUserProfileActiveDevicesFixture,
} from './fixtures/user-profile-active-devices';

export { default as __source } from './user-profile-active-devices-section.stories?raw';

export const meta: StoryMeta = {
  group: 'User Profile',
  status: 'wip',
  title: 'UserProfileActiveDevicesSection',
  label: 'Active devices',
  navigation: { category: 'Sections' },
  source: 'packages/mosaic/src/features/user-profile/user-profile-active-devices-section.view.tsx',
};

export function Default() {
  const devices = useUserProfileActiveDevicesFixture();

  return <UserProfileActiveDevicesSectionView {...devices} />;
}

export function SignOutError() {
  const devices = useUserProfileActiveDevicesFixture({
    failWith: 'This device could not be signed out. Please try again.',
  });

  return <UserProfileActiveDevicesSectionView {...devices} />;
}

export function Impersonation() {
  const devices = useUserProfileActiveDevicesFixture({ devices: userProfileImpersonationDevices });

  return (
    <UserProfileActiveDevicesSectionView
      devices={devices.devices}
      onSignOutDevice={devices.onSignOutDevice}
    />
  );
}
