import { useState } from 'react';

import type { UserProfileActiveDevicesModel } from './user-profile-active-devices-section.model';

export function useUserProfileActiveDevicesController(
  model: Extract<UserProfileActiveDevicesModel, { status: 'ready' }>,
) {
  const [removedIds, setRemovedIds] = useState<string[]>([]);

  return {
    devices: model.devices.filter(device => !removedIds.includes(device.id)),
    onSignOutDevice: async (id: string) => {
      await model.revoke(id);
      setRemovedIds(ids => [...ids, id]);
    },
  };
}
