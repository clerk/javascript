import type { UserProfileDevice } from './user-profile-active-devices.types';
import { UserProfileActiveDevicesSectionView } from './user-profile-active-devices-section.view';

const PLACEHOLDER_DEVICES: UserProfileDevice[] = [
  { id: 'current', name: 'Chrome on macOS', description: 'San Francisco, US', type: 'desktop', isCurrent: true },
  { id: 'phone', name: 'Safari on iOS', description: 'San Francisco, US', type: 'mobile' },
  { id: 'laptop', name: 'Firefox on Windows', description: 'Denver, US', type: 'desktop' },
];

export function UserProfileActiveDevicesSectionSkeleton() {
  return (
    <UserProfileActiveDevicesSectionView
      skeleton
      devices={PLACEHOLDER_DEVICES}
    />
  );
}
