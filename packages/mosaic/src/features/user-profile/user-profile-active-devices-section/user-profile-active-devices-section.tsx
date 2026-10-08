import type { ReactNode } from 'react';

import { useUserProfileActiveDevicesController } from './user-profile-active-devices-section.controller';
import type { UserProfileActiveDevicesModel } from './user-profile-active-devices-section.model';
import { useUserProfileActiveDevicesModel } from './user-profile-active-devices-section.model';
import { UserProfileActiveDevicesSectionView } from './user-profile-active-devices-section.view';

export function UserProfileActiveDevicesSection({ fallback = null }: { fallback?: ReactNode }) {
  const model = useUserProfileActiveDevicesModel();
  if (model.status === 'hidden') {
    return null;
  }
  if (model.status === 'loading') {
    return fallback;
  }
  return (
    <ActiveDevices
      key={model.identity}
      model={model}
    />
  );
}

function ActiveDevices({ model }: { model: Extract<UserProfileActiveDevicesModel, { status: 'ready' }> }) {
  const controller = useUserProfileActiveDevicesController(model);
  return <UserProfileActiveDevicesSectionView {...controller} />;
}
