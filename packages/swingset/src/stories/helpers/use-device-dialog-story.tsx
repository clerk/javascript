import { Freeze } from '@clerk/headless/utils';
import { Card } from '@clerk/ui/mosaic/components/card';
import { Dialog } from '@clerk/ui/mosaic/components/dialog';
import type { UserProfileDeviceDetails } from '@clerk/ui/mosaic/user-profile/dialogs/flow.types';
import { UserProfileDeviceDialogView } from '@clerk/ui/mosaic/user-profile/user-profile-device-dialog.view';
import { useState } from 'react';

export function useDeviceDialogStory({ onSignOut }: { onSignOut?: (id: string) => void } = {}) {
  const [device, setDevice] = useState<UserProfileDeviceDetails | null>(null);

  return {
    openDeviceDialog: (nextDevice: UserProfileDeviceDetails) => {
      setDevice(nextDevice);
    },
    deviceDialog: (
      <Dialog.Root
        size='card'
        open={Boolean(device)}
        onOpenChange={open => {
          if (!open) {
            setDevice(null);
          }
        }}
      >
        <Dialog.Portal>
          <Dialog.Backdrop />
          <Dialog.Viewport>
            <Dialog.Popup
              render={
                <Card.Root
                  elevation='overlay'
                  renderBranding={false}
                />
              }
            >
              <Freeze frozen={!device}>
                {device ? (
                  <UserProfileDeviceDialogView
                    state={{ device, isSubmitting: false, errors: {} }}
                    onSignOut={() => {
                      onSignOut?.(device.id);
                      setDevice(null);
                    }}
                  />
                ) : null}
              </Freeze>
            </Dialog.Popup>
          </Dialog.Viewport>
        </Dialog.Portal>
      </Dialog.Root>
    ),
  };
}
