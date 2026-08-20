import type { UserProfileDeviceDetails } from '@clerk/ui/mosaic/user-profile/dialogs/flow.types';
import { UserProfileDeviceDialogView } from '@clerk/ui/mosaic/user-profile/user-profile-device-dialog.view';
import { useState } from 'react';

export function useDeviceDialogStory({ onSignOut }: { onSignOut?: (id: string) => void } = {}) {
  const [device, setDevice] = useState<UserProfileDeviceDetails | null>(null);
  const [confirming, setConfirming] = useState(false);

  return {
    openDeviceDialog: (nextDevice: UserProfileDeviceDetails) => {
      setDevice(nextDevice);
      setConfirming(false);
    },
    deviceDialog: device ? (
      <UserProfileDeviceDialogView
        open
        state={{ step: confirming ? 'confirm' : 'details', device, isSubmitting: false, errors: {} }}
        onOpenChange={open => {
          if (!open) {
            setDevice(null);
          }
        }}
        onRequestSignOut={() => setConfirming(true)}
        onCancelSignOut={() => setConfirming(false)}
        onSignOut={() => {
          onSignOut?.(device.id);
          setDevice(null);
        }}
      />
    ) : null,
  };
}
