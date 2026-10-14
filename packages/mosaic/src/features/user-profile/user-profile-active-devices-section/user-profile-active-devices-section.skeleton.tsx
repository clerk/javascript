import type { UserProfileDevice } from './user-profile-active-devices.types';
import { useUserProfileActiveDevicesController } from './user-profile-active-devices-section.controller';
import { UserProfileActiveDevicesSectionView } from './user-profile-active-devices-section.view';

const PLACEHOLDER_DEVICES: UserProfileDevice[] = [
  { id: 'current', name: 'Chrome on macOS', description: 'San Francisco, US', type: 'desktop', isCurrent: true },
  { id: 'phone', name: 'Safari on iOS', description: 'San Francisco, US', type: 'mobile' },
  { id: 'laptop', name: 'Firefox on Windows', description: 'Denver, US', type: 'desktop' },
];

export function UserProfileActiveDevicesSectionSkeleton() {
  const controller = useUserProfileActiveDevicesController({ devices: PLACEHOLDER_DEVICES });
  return (
    <UserProfileActiveDevicesSectionView
      {...controller}
      skeleton
    />
  );
}
