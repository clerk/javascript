import type { ReactNode } from 'react';

import { useReverificationFlow } from '../../reverification';
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
  const [revoke, reverification] = useReverificationFlow(model.revoke);
  const controller = useUserProfileActiveDevicesController({ devices: model.devices, revoke, reverification });
  return <UserProfileActiveDevicesSectionView {...controller} />;
}
