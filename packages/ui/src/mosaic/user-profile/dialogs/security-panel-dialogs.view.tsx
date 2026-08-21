import { Freeze } from '@clerk/headless/utils';
import type { ReactNode, RefObject } from 'react';

import { AlertDialog } from '../../components/alert-dialog';
import { Card } from '../../components/card';
import { Dialog } from '../../components/dialog';
import { UserProfileBackupCodesDialogView } from '../user-profile-backup-codes-dialog.view';
import { UserProfileDeleteAccountDialogView } from '../user-profile-delete-account-dialog.view';
import { UserProfileDeviceDialogView } from '../user-profile-device-dialog.view';
import { UserProfileMfaAddDialogView, UserProfileMfaRemoveDialogView } from '../user-profile-mfa-dialog.view';
import {
  UserProfilePasskeyRemoveDialogView,
  UserProfilePasskeyRenameDialogView,
} from '../user-profile-passkey-dialog.view';
import { UserProfilePasswordDialogView } from '../user-profile-password-dialog.view';
import { UserProfileSignOutAllDevicesDialogView } from '../user-profile-sign-out-all-devices-dialog.view';
import type { UserProfileSecurityPanelFlows, UserProfileSecurityReverificationOperation } from './flow.types';
import { ReverificationDialogView } from './reverification-dialog.view';

export type SecurityPanelDialogsViewProps = UserProfileSecurityPanelFlows;

export function SecurityPanelDialogsView({
  passwordTriggerRef,
  passkeysTriggerRef,
  mfaTriggerRef,
  deleteTriggerRef,
  activeDevicesTriggerRef,
  password,
  renamePasskey,
  removePasskey,
  addMfa,
  removeMfa,
  backupCodes,
  deleteAccount,
  device,
  signOutAllDevices,
  reverification,
}: SecurityPanelDialogsViewProps) {
  const verificationDialog = (operation: UserProfileSecurityReverificationOperation) => {
    if (reverification?.operation !== operation) {
      return null;
    }

    return (
      <Dialog
        open
        onOpenChange={open => {
          if (!open) {
            reverification.onCancel();
          }
        }}
      >
        <ReverificationDialogView
          state={reverification.state}
          onCancel={reverification.onCancel}
          onResend={reverification.onResend}
          onSubmit={reverification.onSubmit}
          onValueChange={reverification.onValueChange}
        />
      </Dialog>
    );
  };

  return (
    <>
      <FlowCardDialog
        finalFocus={passwordTriggerRef}
        open={Boolean(password)}
        onOpenChange={open => {
          if (!open && !password?.state.isSubmitting) {
            password?.onCancel();
          }
        }}
      >
        <Freeze frozen={!password}>
          {password ? (
            <UserProfilePasswordDialogView
              state={password.state}
              isInterrupted={reverification?.operation === 'password'}
              onCancel={password.onCancel}
              onValueChange={password.onValueChange}
              onSubmit={password.onSubmit}
            />
          ) : null}
        </Freeze>
        {verificationDialog('password')}
      </FlowCardDialog>

      {verificationDialog('add-passkey')}

      <FlowCardDialog
        finalFocus={passkeysTriggerRef}
        open={Boolean(renamePasskey)}
        onOpenChange={open => {
          if (!open && !renamePasskey?.state.isSubmitting) {
            renamePasskey?.onCancel();
          }
        }}
      >
        <Freeze frozen={!renamePasskey}>
          {renamePasskey ? (
            <UserProfilePasskeyRenameDialogView
              state={renamePasskey.state}
              isInterrupted={false}
              onCancel={renamePasskey.onCancel}
              onNameChange={renamePasskey.onNameChange}
              onRename={renamePasskey.onRename}
            />
          ) : null}
        </Freeze>
      </FlowCardDialog>

      <AlertDialog
        finalFocus={passkeysTriggerRef}
        open={Boolean(removePasskey)}
        onOpenChange={open => {
          if (!open && !removePasskey?.state.isSubmitting) {
            removePasskey?.onCancel();
          }
        }}
      >
        <Freeze frozen={!removePasskey}>
          {removePasskey ? (
            <UserProfilePasskeyRemoveDialogView
              state={removePasskey.state}
              isInterrupted={reverification?.operation === 'remove-passkey'}
              onCancel={removePasskey.onCancel}
              onRemove={removePasskey.onRemove}
            />
          ) : null}
        </Freeze>
        {verificationDialog('remove-passkey')}
      </AlertDialog>

      <FlowCardDialog
        finalFocus={mfaTriggerRef}
        open={Boolean(addMfa)}
        size='card'
        onOpenChange={open => {
          if (!open && !addMfa?.state.isSubmitting) {
            addMfa?.onCancel();
          }
        }}
      >
        <Freeze frozen={!addMfa}>
          {addMfa ? (
            <UserProfileMfaAddDialogView
              state={addMfa.state}
              isInterrupted={reverification?.operation === 'add-mfa'}
              onAddPhone={addMfa.onAddPhone}
              onBack={addMfa.onBack}
              onCancel={addMfa.onCancel}
              onCodeChange={addMfa.onCodeChange}
              onCopyBackupCodes={addMfa.onCopyBackupCodes}
              onCopySecret={addMfa.onCopySecret}
              onDownloadBackupCodes={addMfa.onDownloadBackupCodes}
              onFinish={addMfa.onFinish}
              onPhoneNumberChange={addMfa.onPhoneNumberChange}
              onPrintBackupCodes={addMfa.onPrintBackupCodes}
              onResend={addMfa.onResend}
              onSelectPhone={addMfa.onSelectPhone}
              onSubmit={addMfa.onSubmit}
              onToggleDisplayFormat={addMfa.onToggleDisplayFormat}
            />
          ) : null}
        </Freeze>
        {verificationDialog('add-mfa')}
      </FlowCardDialog>

      <AlertDialog
        finalFocus={mfaTriggerRef}
        open={Boolean(removeMfa)}
        onOpenChange={open => {
          if (!open && !removeMfa?.state.isSubmitting) {
            removeMfa?.onCancel();
          }
        }}
      >
        <Freeze frozen={!removeMfa}>
          {removeMfa ? (
            <UserProfileMfaRemoveDialogView
              state={removeMfa.state}
              isInterrupted={reverification?.operation === 'remove-mfa'}
              onCancel={removeMfa.onCancel}
              onRemove={removeMfa.onRemove}
            />
          ) : null}
        </Freeze>
        {verificationDialog('remove-mfa')}
      </AlertDialog>

      <FlowCardDialog
        finalFocus={mfaTriggerRef}
        open={Boolean(backupCodes)}
        size='card'
        onOpenChange={open => {
          if (!open && !backupCodes?.state.isSubmitting) {
            backupCodes?.onCancel();
          }
        }}
      >
        <Freeze frozen={!backupCodes}>
          {backupCodes ? (
            <UserProfileBackupCodesDialogView
              state={backupCodes.state}
              isInterrupted={reverification?.operation === 'backup-codes'}
              onCancel={backupCodes.onCancel}
              onCopyAndClose={backupCodes.onCopyAndClose}
              onDownload={backupCodes.onDownload}
              onPrint={backupCodes.onPrint}
              onRetry={backupCodes.onRetry}
            />
          ) : null}
        </Freeze>
        {verificationDialog('backup-codes')}
      </FlowCardDialog>

      <AlertDialog
        finalFocus={deleteTriggerRef}
        open={Boolean(deleteAccount)}
        onOpenChange={open => {
          if (!open && !deleteAccount?.state.isSubmitting) {
            deleteAccount?.onCancel();
          }
        }}
      >
        <Freeze frozen={!deleteAccount}>
          {deleteAccount ? (
            <UserProfileDeleteAccountDialogView
              state={deleteAccount.state}
              isInterrupted={reverification?.operation === 'delete-account'}
              onCancel={deleteAccount.onCancel}
              onConfirmationChange={deleteAccount.onConfirmationChange}
              onDelete={deleteAccount.onDelete}
            />
          ) : null}
        </Freeze>
        {verificationDialog('delete-account')}
      </AlertDialog>

      <AlertDialog
        finalFocus={activeDevicesTriggerRef}
        open={Boolean(signOutAllDevices)}
        onOpenChange={open => {
          if (!open && !signOutAllDevices?.state.isSubmitting) {
            signOutAllDevices?.onCancel();
          }
        }}
      >
        <Freeze frozen={!signOutAllDevices}>
          {signOutAllDevices ? (
            <UserProfileSignOutAllDevicesDialogView
              state={signOutAllDevices.state}
              isInterrupted={reverification?.operation === 'sign-out-all-devices'}
              onCancel={signOutAllDevices.onCancel}
              onSignOut={signOutAllDevices.onSignOut}
            />
          ) : null}
        </Freeze>
        {verificationDialog('sign-out-all-devices')}
      </AlertDialog>

      <FlowCardDialog
        finalFocus={activeDevicesTriggerRef}
        open={Boolean(device)}
        size='card'
        onOpenChange={open => {
          if (!open && !device?.state.isSubmitting) {
            device?.onCancel();
          }
        }}
      >
        <Freeze frozen={!device}>
          {device ? (
            <UserProfileDeviceDialogView
              state={device.state}
              isInterrupted={reverification?.operation === 'sign-out-device'}
              onSignOut={device.onSignOut}
            />
          ) : null}
        </Freeze>
        {device ? verificationDialog('sign-out-device') : null}
      </FlowCardDialog>

      {!device ? verificationDialog('sign-out-device') : null}
    </>
  );
}

function FlowCardDialog({
  open,
  finalFocus,
  size = 'prompt',
  onOpenChange,
  children,
}: {
  open: boolean;
  finalFocus?: RefObject<HTMLElement | null>;
  size?: 'prompt' | 'card';
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}) {
  return (
    <Dialog.Root
      open={open}
      size={size}
      onOpenChange={onOpenChange}
    >
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Viewport>
          <Dialog.Popup
            finalFocus={finalFocus}
            render={
              size === 'card' ? (
                <Card.Root
                  elevation='overlay'
                  renderBranding={false}
                />
              ) : undefined
            }
          >
            {children}
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
