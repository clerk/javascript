import { UserProfileSignOutAllDevicesDialogView } from '@clerk/ui/mosaic/user-profile/user-profile-sign-out-all-devices-dialog.view';
import { useState } from 'react';

export function useSignOutAllDevicesDialogStory({ onSignOut }: { onSignOut?: () => void } = {}) {
  const [open, setOpen] = useState(false);

  return {
    openSignOutAllDevicesDialog: () => setOpen(true),
    signOutAllDevicesDialog: (
      <UserProfileSignOutAllDevicesDialogView
        open={open}
        onOpenChange={setOpen}
        onSignOut={() => {
          onSignOut?.();
          setOpen(false);
        }}
      />
    ),
  };
}
