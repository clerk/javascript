import type { ReactNode } from 'react';

import { useUserProfileActiveDevicesController } from './user-profile-active-devices-section.controller';
import type { ReadyActiveDevicesModel } from './user-profile-active-devices-section.model';
import { useUserProfileActiveDevicesModel } from './user-profile-active-devices-section.model';
import { UserProfileActiveDevicesSectionSkeleton } from './user-profile-active-devices-section.skeleton';
import { UserProfileActiveDevicesSectionView } from './user-profile-active-devices-section.view';

export function UserProfileActiveDevicesSection({ fallback = null }: { fallback?: ReactNode }) {
  const model = useUserProfileActiveDevicesModel();
  if (model.status === 'hidden') {
    return null;
  }
  if (model.status === 'loading') {
    return fallback;
  }
  if (model.status === 'loadingDevices') {
    return <UserProfileActiveDevicesSectionSkeleton />;
  }
  return (
    <ActiveDevices
      key={model.identity}
      model={model}
    />
  );
}

function ActiveDevices({ model }: { model: ReadyActiveDevicesModel }) {
  const controller = useUserProfileActiveDevicesController(model);
  return <UserProfileActiveDevicesSectionView {...controller} />;
}
