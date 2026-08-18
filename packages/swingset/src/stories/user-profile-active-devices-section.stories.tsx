import type { UserProfileDevice } from '@clerk/ui/mosaic/user-profile/user-profile-active-devices-section.view';
import { UserProfileActiveDevicesSectionView } from '@clerk/ui/mosaic/user-profile/user-profile-active-devices-section.view';
import { useState } from 'react';

import type { StoryMeta } from '@/lib/types';

export { default as __source } from './user-profile-active-devices-section.stories?raw';

export const meta: StoryMeta = {
  group: 'User',
  title: 'UserProfileActiveDevicesSection',
  label: 'Active devices',
  navigation: { family: 'User profile', category: 'Sections', order: 50 },
  source: 'packages/ui/src/mosaic/user-profile/user-profile-active-devices-section.view.tsx',
};

export function Default() {
  const [devices, setDevices] = useState<UserProfileDevice[]>([
    {
      id: 'current',
      name: 'Safari on macOS',
      description: 'Salt Lake City, UT, United States',
      type: 'desktop',
      isCurrent: true,
    },
    {
      id: 'mobile',
      name: 'Safari on iOS',
      description: 'Last seen 2 weeks ago · Orem, UT, United States',
      type: 'mobile',
    },
    {
      id: 'desktop',
      name: 'Clerk App on macOS',
      description: 'Last seen May 14th, 2026 · San Francisco, CA, United States',
      type: 'desktop',
    },
  ]);

  return (
    <UserProfileActiveDevicesSectionView
      devices={devices}
      onManageDevice={() => undefined}
      onSignOutAllOtherDevices={() => setDevices(current => current.filter(device => device.isCurrent))}
      onSignOutDevice={id => setDevices(current => current.filter(device => device.id !== id))}
    />
  );
}
