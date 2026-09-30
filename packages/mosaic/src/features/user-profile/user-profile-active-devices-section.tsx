import type { ReactNode } from 'react';

import { Button } from '../../components/button';
import { useMessages } from '../../localization';
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
      fallback={fallback}
    />
  );
}

function ActiveDevices({
  model,
  fallback,
}: {
  model: Extract<UserProfileActiveDevicesModel, { status: 'ready' }>;
  fallback: ReactNode;
}) {
  const controller = useUserProfileActiveDevicesController(model);
  const m = useMessages('userProfileActiveDevices');

  if (controller.status === 'loading') {
    return fallback;
  }
  if (controller.status === 'error') {
    return (
      <div role='alert'>
        {m.loadError}
        <Button onClick={controller.retry}>{m.retry}</Button>
      </div>
    );
  }
  return <UserProfileActiveDevicesSectionView {...controller} />;
}
