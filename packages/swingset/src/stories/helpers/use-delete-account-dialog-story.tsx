import { UserProfileDeleteAccountDialogView } from '@clerk/ui/mosaic/user-profile/user-profile-delete-account-dialog.view';
import { useState } from 'react';

export function useDeleteAccountDialogStory({ onDelete }: { onDelete?: () => void } = {}) {
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState('');

  const close = () => {
    setOpen(false);
    setConfirmation('');
  };

  return {
    openDeleteAccountDialog: () => setOpen(true),
    deleteAccountDialog: (
      <UserProfileDeleteAccountDialogView
        open={open}
        confirmation={confirmation}
        onOpenChange={nextOpen => {
          setOpen(nextOpen);
          if (!nextOpen) {
            setConfirmation('');
          }
        }}
        onConfirmationChange={setConfirmation}
        onDelete={() => {
          onDelete?.();
          close();
        }}
      />
    ),
  };
}
