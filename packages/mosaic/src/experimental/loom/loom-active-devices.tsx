import { useLoom } from '@clerk/loom/react';

import { Button } from '../../components/button';
import { useUserProfileActiveDevicesController } from '../../features/user-profile/user-profile-active-devices-section/user-profile-active-devices-section.controller';
import { UserProfileActiveDevicesSectionView } from '../../features/user-profile/user-profile-active-devices-section/user-profile-active-devices-section.view';
import { useLoomActiveDevicesModel } from './loom-active-devices.model';

export function LoomActiveDevices({ showRefresh = true }: { showRefresh?: boolean }) {
  const client = useLoom();
  return (
    <ScopedActiveDevices
      key={`${client.scope.instanceKey}:${client.scope.userId}:${client.scope.sessionId}`}
      showRefresh={showRefresh}
    />
  );
}
function ScopedActiveDevices({ showRefresh }: { showRefresh: boolean }) {
  const model = useLoomActiveDevicesModel();
  const controller = useUserProfileActiveDevicesController(model);
  return (
    <>
      {showRefresh ? (
        <Button
          type='button'
          variant='outline'
          disabled={!model.refresh || model.refreshing}
          onClick={() => void model.refresh?.()}
        >
          Refresh devices
        </Button>
      ) : null}
      {model.pending ? <p role='status'>Checking devices</p> : null}
      {model.error ? <p role='alert'>{model.error}</p> : null}
      {!model.pending && !model.error && model.devices.length === 0 ? <p>No active devices</p> : null}
      {model.devices.length > 0 ? <UserProfileActiveDevicesSectionView {...controller} /> : null}
    </>
  );
}
