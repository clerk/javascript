import { UserProfileSignOutAllDevicesDialogView } from '@clerk/ui/mosaic/user-profile/user-profile-sign-out-all-devices-dialog.view';
import { useState } from 'react';

export function useSignOutAllDevicesDialogStory({ onSignOut }: { onSignOut?: () => void } = {}) {
  const [open, setOpen] = useState(false);

  return {
    openSignOutAllDevicesDialog: () => setOpen(true),
    signOutAllDevicesDialog: (
      <AlertDialog
        open={open}
        onOpenChange={setOpen}
      >
        <UserProfileSignOutAllDevicesDialogView
          state={{ isSubmitting: false, errors: {} }}
          onCancel={() => setOpen(false)}
          onSignOut={() => {
            onSignOut?.();
            setOpen(false);
          }}
        />
      </AlertDialog>
    ),
  };
}
import { AlertDialog } from '@clerk/ui/mosaic/components/alert-dialog';
