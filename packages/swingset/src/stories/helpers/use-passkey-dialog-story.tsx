import type {
  UserProfilePasskeyAddFlowState,
  UserProfilePasskeyRemoveFlowState,
  UserProfilePasskeyRenameFlowState,
} from '@clerk/ui/mosaic/user-profile/dialogs/flow.types';
import {
  UserProfilePasskeyAddDialogView,
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
  const [add, setAdd] = useState<UserProfilePasskeyAddFlowState | null>(null);
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
    openAddPasskeyDialog: () => setAdd({ isSubmitting: false, errors: {} }),
    openRenamePasskeyDialog,
    openRemovePasskeyDialog,
    passkeyDialogs: (
      <>
        {add ? (
          <UserProfilePasskeyAddDialogView
            open
            state={add}
            onOpenChange={open => {
              if (!open) {
                setAdd(null);
              }
            }}
            onAdd={() => {
              onChange([
                ...passkeys,
                {
                  id: `passkey-${Date.now()}`,
                  name: `Passkey ${passkeys.length + 1}`,
                  createdAtLabel: 'Created just now',
                },
              ]);
              setAdd(null);
            }}
          />
        ) : null}
        {rename ? (
          <UserProfilePasskeyRenameDialogView
            open
            state={rename}
            onOpenChange={open => {
              if (!open) {
                setRename(null);
              }
            }}
            onNameChange={name => setRename(current => (current ? { ...current, name, errors: {} } : current))}
            onRename={() => {
              onChange(
                passkeys.map(passkey => (passkey.id === rename.id ? { ...passkey, name: rename.name } : passkey)),
              );
              setRename(null);
            }}
          />
        ) : null}
        {remove ? (
          <UserProfilePasskeyRemoveDialogView
            open
            state={remove}
            onOpenChange={open => {
              if (!open) {
                setRemove(null);
              }
            }}
            onRemove={() => {
              onChange(passkeys.filter(passkey => passkey.id !== remove.id));
              setRemove(null);
            }}
          />
        ) : null}
      </>
    ),
  };
}
