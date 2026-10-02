import type { ReactNode } from 'react';

import { Button } from '../../components/button';
import { useMessages } from '../../localization';
import { useUserProfileActiveDevicesController } from './user-profile-active-devices-section.controller';
import type { UserProfileActiveDevicesModel } from './user-profile-active-devices-section.model';
import { useUserProfileActiveDevicesModel } from './user-profile-active-devices-section.model';
import { UserProfileActiveDevicesSectionView } from './user-profile-active-devices-section.view';

export function UserProfileActiveDevicesSection({ fallback = null }: { fallback?: ReactNode }) {
  const model = useUserProfileActiveDevicesModel();
  const m = useMessages('userProfileActiveDevices');
  if (model.status === 'hidden') {
    return null;
  }
  if (model.status === 'loading') {
    return fallback;
  }
  if (model.status === 'error') {
    return (
      <div role='alert'>
        {model.message}
        <Button onClick={model.retry}>{m.retry}</Button>
      </div>
    );
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
