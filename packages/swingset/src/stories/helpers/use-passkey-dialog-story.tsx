import type {
  UserProfilePasskeyRemoveFlowState,
  UserProfilePasskeyRenameFlowState,
} from '@clerk/ui/mosaic/user-profile/dialogs/flow.types';
import {
  UserProfilePasskeyRemoveDialogView,
  UserProfilePasskeyRenameDialogView,
} from '@clerk/ui/mosaic/user-profile/user-profile-passkey-dialog.view';
import type { UserProfilePasskey } from '@clerk/ui/mosaic/user-profile/user-profile-passkeys-section.view';
import { useState } from 'react';

export function usePasskeyDialogStory({
  passkeys,
  onChange,
}: {
  passkeys: UserProfilePasskey[];
  onChange: (passkeys: UserProfilePasskey[]) => void;
}) {
  const [rename, setRename] = useState<UserProfilePasskeyRenameFlowState | null>(null);
  const [remove, setRemove] = useState<UserProfilePasskeyRemoveFlowState | null>(null);

  const openRenamePasskeyDialog = (id: string) => {
    const passkey = passkeys.find(candidate => candidate.id === id);
    if (passkey) {
      setRename({ id, originalName: passkey.name, name: passkey.name, isSubmitting: false, errors: {} });
    }
  };

  const openRemovePasskeyDialog = (id: string) => {
    const passkey = passkeys.find(candidate => candidate.id === id);
    if (passkey) {
      setRemove({ id, name: passkey.name, isSubmitting: false, errors: {} });
    }
  };

  return {
    addPasskey: () =>
      onChange([
        ...passkeys,
        {
          id: `passkey-${Date.now()}`,
          name: `Passkey ${passkeys.length + 1}`,
          createdAtLabel: 'Created just now',
        },
      ]),
    openRenamePasskeyDialog,
    openRemovePasskeyDialog,
    passkeyDialogs: (
      <>
        <PasskeyDialog
          open={Boolean(rename)}
          onOpenChange={open => {
            if (!open) {
              setRename(null);
            }
          }}
        >
          <Freeze frozen={!rename}>
            {rename ? (
              <UserProfilePasskeyRenameDialogView
                state={rename}
                onCancel={() => setRename(null)}
                onNameChange={name => setRename(current => (current ? { ...current, name, errors: {} } : current))}
                onRename={() => {
                  onChange(
                    passkeys.map(passkey => (passkey.id === rename.id ? { ...passkey, name: rename.name } : passkey)),
                  );
                  setRename(null);
                }}
              />
            ) : null}
          </Freeze>
        </PasskeyDialog>
        <AlertDialog
          open={Boolean(remove)}
          onOpenChange={open => {
            if (!open) {
              setRemove(null);
            }
          }}
        >
          <Freeze frozen={!remove}>
            {remove ? (
              <UserProfilePasskeyRemoveDialogView
                state={remove}
                onCancel={() => setRemove(null)}
                onRemove={() => {
                  onChange(passkeys.filter(passkey => passkey.id !== remove.id));
                  setRemove(null);
                }}
              />
            ) : null}
          </Freeze>
        </AlertDialog>
      </>
    ),
  };
}

function PasskeyDialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={onOpenChange}
    >
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Viewport>
          <Dialog.Popup>{children}</Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
import { Freeze } from '@clerk/headless/utils';
import { AlertDialog } from '@clerk/ui/mosaic/components/alert-dialog';
import { Dialog } from '@clerk/ui/mosaic/components/dialog';
