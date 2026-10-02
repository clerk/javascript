import { useState } from 'react';

import type { UserProfileActiveDevicesModel } from './user-profile-active-devices-section.model';

export function useUserProfileActiveDevicesController(
  model: Extract<UserProfileActiveDevicesModel, { status: 'ready' }>,
) {
  const [removedIds, setRemovedIds] = useState<string[]>([]);

  return {
    devices: model.devices.filter(device => !removedIds.includes(device.id)),
    onSignOutDevice: async (id: string) => {
      const removed = await model.revoke(id);
      if (removed) {
        setRemovedIds(ids => [...ids, id]);
      }
      return removed;
    },
    // TODO: Wire the model's future bulk action to onSignOutAllOtherDevices and refresh the device list after it settles.
  };
}
