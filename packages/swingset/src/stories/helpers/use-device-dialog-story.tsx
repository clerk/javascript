import { Freeze } from '@clerk/headless/utils';
import { AlertDialog } from '@clerk/ui/mosaic/components/alert-dialog';
import { Card } from '@clerk/ui/mosaic/components/card';
import { Dialog } from '@clerk/ui/mosaic/components/dialog';
import type { UserProfileDeviceDetails } from '@clerk/ui/mosaic/user-profile/dialogs/flow.types';
import {
  UserProfileDeviceDialogView,
  UserProfileDeviceSignOutDialogView,
} from '@clerk/ui/mosaic/user-profile/user-profile-device-dialog.view';
import { useState } from 'react';

export function useDeviceDialogStory({ onSignOut }: { onSignOut?: (id: string) => void } = {}) {
  const [device, setDevice] = useState<UserProfileDeviceDetails | null>(null);
  const [confirming, setConfirming] = useState(false);

  return {
    openDeviceDialog: (nextDevice: UserProfileDeviceDetails) => {
      setDevice(nextDevice);
      setConfirming(false);
    },
    deviceDialog: (
      <Dialog.Root
        size='card'
        closedBy='closerequest'
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
                    state={{ step: confirming ? 'confirm' : 'details', device, isSubmitting: false, errors: {} }}
                    isInterrupted={confirming}
                    onRequestSignOut={() => setConfirming(true)}
                  />
                ) : null}
              </Freeze>
              <AlertDialog
                open={confirming}
                onOpenChange={open => {
                  if (!open) {
                    setConfirming(false);
                  }
                }}
              >
                {device ? (
                  <UserProfileDeviceSignOutDialogView
                    state={{ step: 'confirm', device, isSubmitting: false, errors: {} }}
                    onCancel={() => setConfirming(false)}
                    onSignOut={() => {
                      onSignOut?.(device.id);
                      setDevice(null);
                    }}
                  />
                ) : null}
              </AlertDialog>
            </Dialog.Popup>
          </Dialog.Viewport>
        </Dialog.Portal>
      </Dialog.Root>
    ),
  };
}
