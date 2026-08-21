import { Freeze } from '@clerk/headless/utils';
import { AlertDialog } from '@clerk/ui/mosaic/components/alert-dialog';
import { Card } from '@clerk/ui/mosaic/components/card';
import { Dialog } from '@clerk/ui/mosaic/components/dialog';
import { ReverificationDialogView } from '@clerk/ui/mosaic/user-profile/dialogs/reverification-dialog.view';
import { UserProfileBackupCodesDialogView } from '@clerk/ui/mosaic/user-profile/user-profile-backup-codes-dialog.view';
import { UserProfileDeleteAccountDialogView } from '@clerk/ui/mosaic/user-profile/user-profile-delete-account-dialog.view';
import {
  UserProfileDeviceDialogView,
  UserProfileDeviceSignOutDialogView,
} from '@clerk/ui/mosaic/user-profile/user-profile-device-dialog.view';
import {
  UserProfileMfaAddDialogView,
  UserProfileMfaRemoveDialogView,
} from '@clerk/ui/mosaic/user-profile/user-profile-mfa-dialog.view';
import {
  UserProfilePasskeyAddDialogView,
  UserProfilePasskeyRemoveDialogView,
  UserProfilePasskeyRenameDialogView,
} from '@clerk/ui/mosaic/user-profile/user-profile-passkey-dialog.view';
import { UserProfilePasswordDialogView } from '@clerk/ui/mosaic/user-profile/user-profile-password-dialog.view';
import { UserProfileSignOutAllDevicesDialogView } from '@clerk/ui/mosaic/user-profile/user-profile-sign-out-all-devices-dialog.view';

import type { useActiveDevicesSectionFlow } from './user-profile-active-devices-section-flow.harness';
import type { useDeleteSectionFlow } from './user-profile-delete-section-flow.harness';
import type { useMfaSectionFlow } from './user-profile-mfa-section-flow.harness';
import type { usePasskeysSectionFlow } from './user-profile-passkeys-section-flow.harness';
import type { usePasswordSectionFlow } from './user-profile-password-section-flow.harness';

type PasswordFlow = ReturnType<typeof usePasswordSectionFlow>;
type PasskeysFlow = ReturnType<typeof usePasskeysSectionFlow>;
type MfaFlow = ReturnType<typeof useMfaSectionFlow>;
type ActiveDevicesFlow = ReturnType<typeof useActiveDevicesSectionFlow>;
type DeleteFlow = ReturnType<typeof useDeleteSectionFlow>;

export function PasswordSectionFlowDialogs({ flow }: { flow: PasswordFlow }) {
  const challenge = flow.reverification?.state ?? null;
  return (
    <FlowDialog
      finalFocus={flow.triggerRef}
      open={Boolean(flow.password)}
      onOpenChange={open => {
        if (!open) {
          flow.closePassword();
        }
      }}
    >
      <Freeze frozen={!flow.password}>
        {flow.password ? (
          <UserProfilePasswordDialogView
            state={flow.password}
            isInterrupted={Boolean(challenge)}
            onCancel={flow.closePassword}
            onValueChange={flow.updatePasswordValue}
            onSubmit={flow.submitPassword}
          />
        ) : null}
      </Freeze>
      <ReverificationDialog
        challenge={challenge}
        flow={flow}
      />
    </FlowDialog>
  );
}

export function PasskeysSectionFlowDialogs({ flow }: { flow: PasskeysFlow }) {
  const operation = flow.reverification?.operation;
  return (
    <>
      <FlowDialog
        finalFocus={flow.triggerRef}
        open={Boolean(flow.addPasskey)}
        onOpenChange={open => {
          if (!open) {
            flow.closeAddPasskey();
          }
        }}
      >
        <Freeze frozen={!flow.addPasskey}>
          {flow.addPasskey ? (
            <UserProfilePasskeyAddDialogView
              state={flow.addPasskey}
              isInterrupted={operation === 'add-passkey'}
              onAdd={flow.submitAddPasskey}
              onCancel={flow.closeAddPasskey}
            />
          ) : null}
        </Freeze>
        <ReverificationDialog
          challenge={operation === 'add-passkey' ? (flow.reverification?.state ?? null) : null}
          flow={flow}
        />
      </FlowDialog>
      <FlowDialog
        finalFocus={flow.triggerRef}
        open={Boolean(flow.renamePasskey)}
        onOpenChange={open => {
          if (!open) {
            flow.closeRenamePasskey();
          }
        }}
      >
        <Freeze frozen={!flow.renamePasskey}>
          {flow.renamePasskey ? (
            <UserProfilePasskeyRenameDialogView
              state={flow.renamePasskey}
              onCancel={flow.closeRenamePasskey}
              onNameChange={flow.updatePasskeyName}
              onRename={flow.submitRenamePasskey}
            />
          ) : null}
        </Freeze>
      </FlowDialog>
      <AlertDialog
        finalFocus={flow.triggerRef}
        open={Boolean(flow.removePasskey)}
        onOpenChange={open => {
          if (!open) {
            flow.closeRemovePasskey();
          }
        }}
      >
        <Freeze frozen={!flow.removePasskey}>
          {flow.removePasskey ? (
            <UserProfilePasskeyRemoveDialogView
              state={flow.removePasskey}
              isInterrupted={operation === 'remove-passkey'}
              onCancel={flow.closeRemovePasskey}
              onRemove={flow.submitRemovePasskey}
            />
          ) : null}
        </Freeze>
        <ReverificationDialog
          challenge={operation === 'remove-passkey' ? (flow.reverification?.state ?? null) : null}
          flow={flow}
        />
      </AlertDialog>
    </>
  );
}

export function MfaSectionFlowDialogs({ flow }: { flow: MfaFlow }) {
  const operation = flow.reverification?.operation;
  return (
    <>
      <FlowDialog
        size='card'
        finalFocus={flow.triggerRef}
        open={Boolean(flow.addMfa)}
        onOpenChange={open => {
          if (!open) {
            flow.closeAddMfa();
          }
        }}
      >
        <Freeze frozen={!flow.addMfa}>
          {flow.addMfa ? (
            <UserProfileMfaAddDialogView
              state={flow.addMfa}
              isInterrupted={operation === 'add-mfa'}
              onCancel={flow.closeAddMfa}
              onCodeChange={flow.updateMfaCode}
              onAddPhone={flow.addNewMfaPhone}
              onSelectPhone={flow.selectMfaPhone}
              onPhoneNumberChange={flow.updateMfaPhoneNumber}
              onResend={() => void flow.resendMfaCode()}
              onBack={flow.backAddMfa}
              onSubmit={code => void flow.submitAddMfa(code)}
              onToggleDisplayFormat={flow.toggleMfaDisplayFormat}
              onCopySecret={flow.copyMfaSecret}
              onCopyBackupCodes={() => {
                if (flow.addMfa?.step === 'backup-codes') {
                  void navigator.clipboard?.writeText(flow.addMfa.codes.join('\n'));
                  flow.markMfaBackupCodesCopied();
                }
              }}
              onDownloadBackupCodes={() => {
                if (flow.addMfa?.step === 'backup-codes') {
                  downloadBackupCodes(flow.addMfa.codes);
                }
              }}
              onPrintBackupCodes={() => window.print()}
              onFinish={flow.finishAddMfa}
            />
          ) : null}
        </Freeze>
        <ReverificationDialog
          challenge={operation === 'add-mfa' ? (flow.reverification?.state ?? null) : null}
          flow={flow}
        />
      </FlowDialog>
      <AlertDialog
        finalFocus={flow.triggerRef}
        open={Boolean(flow.removeMfa)}
        onOpenChange={open => {
          if (!open) {
            flow.closeRemoveMfa();
          }
        }}
      >
        <Freeze frozen={!flow.removeMfa}>
          {flow.removeMfa ? (
            <UserProfileMfaRemoveDialogView
              state={flow.removeMfa}
              isInterrupted={operation === 'remove-mfa'}
              onCancel={flow.closeRemoveMfa}
              onRemove={flow.submitRemoveMfa}
            />
          ) : null}
        </Freeze>
        <ReverificationDialog
          challenge={operation === 'remove-mfa' ? (flow.reverification?.state ?? null) : null}
          flow={flow}
        />
      </AlertDialog>
      <FlowDialog
        size='card'
        finalFocus={flow.triggerRef}
        open={Boolean(flow.backupCodes)}
        onOpenChange={open => {
          if (!open) {
            flow.closeBackupCodes();
          }
        }}
      >
        <Freeze frozen={!flow.backupCodes}>
          {flow.backupCodes ? (
            <UserProfileBackupCodesDialogView
              state={flow.backupCodes}
              isInterrupted={operation === 'backup-codes'}
              onCancel={flow.closeBackupCodes}
              onRetry={flow.regenerateBackupCodes}
              onCopy={() => {
                if (flow.backupCodes?.step === 'codes') {
                  void navigator.clipboard?.writeText(flow.backupCodes.codes.join('\n'));
                  flow.markBackupCodesCopied();
                }
              }}
              onDownload={() => {
                if (flow.backupCodes?.step === 'codes') {
                  downloadBackupCodes(flow.backupCodes.codes);
                }
              }}
              onPrint={() => window.print()}
            />
          ) : null}
        </Freeze>
        <ReverificationDialog
          challenge={operation === 'backup-codes' ? (flow.reverification?.state ?? null) : null}
          flow={flow}
        />
      </FlowDialog>
    </>
  );
}

export function ActiveDevicesSectionFlowDialogs({ flow }: { flow: ActiveDevicesFlow }) {
  const operation = flow.reverification?.operation;
  return (
    <>
      <AlertDialog
        finalFocus={flow.triggerRef}
        open={Boolean(flow.signOutAllDevices)}
        onOpenChange={open => {
          if (!open) {
            flow.closeSignOutAllDevices();
          }
        }}
      >
        <Freeze frozen={!flow.signOutAllDevices}>
          {flow.signOutAllDevices ? (
            <UserProfileSignOutAllDevicesDialogView
              state={flow.signOutAllDevices}
              isInterrupted={operation === 'sign-out-all-devices'}
              onCancel={flow.closeSignOutAllDevices}
              onSignOut={flow.submitSignOutAllDevices}
            />
          ) : null}
        </Freeze>
        <ReverificationDialog
          challenge={operation === 'sign-out-all-devices' ? (flow.reverification?.state ?? null) : null}
          flow={flow}
        />
      </AlertDialog>
      <FlowDialog
        size='card'
        finalFocus={flow.triggerRef}
        open={Boolean(flow.device)}
        onOpenChange={open => {
          if (!open) {
            flow.closeDevice();
          }
        }}
      >
        <Freeze frozen={!flow.device}>
          {flow.device ? (
            <UserProfileDeviceDialogView
              state={flow.device}
              isInterrupted={flow.device.step === 'confirm'}
              onRequestSignOut={flow.requestSignOutDevice}
            />
          ) : null}
        </Freeze>
        <AlertDialog
          open={flow.device?.step === 'confirm'}
          onOpenChange={open => {
            if (!open) {
              flow.cancelSignOutDevice();
            }
          }}
        >
          <Freeze frozen={flow.device?.step !== 'confirm'}>
            {flow.device?.step === 'confirm' ? (
              <UserProfileDeviceSignOutDialogView
                state={flow.device}
                isInterrupted={operation === 'sign-out-device'}
                onCancel={flow.cancelSignOutDevice}
                onSignOut={flow.submitSignOutDevice}
              />
            ) : null}
          </Freeze>
          <ReverificationDialog
            challenge={operation === 'sign-out-device' ? (flow.reverification?.state ?? null) : null}
            flow={flow}
          />
        </AlertDialog>
      </FlowDialog>
    </>
  );
}

export function DeleteSectionFlowDialogs({ flow }: { flow: DeleteFlow }) {
  const challenge = flow.reverification?.state ?? null;
  return (
    <AlertDialog
      finalFocus={flow.triggerRef}
      open={Boolean(flow.deleteAccount)}
      onOpenChange={open => {
        if (!open) {
          flow.closeDeleteAccount();
        }
      }}
    >
      <Freeze frozen={!flow.deleteAccount}>
        {flow.deleteAccount ? (
          <UserProfileDeleteAccountDialogView
            state={flow.deleteAccount}
            isInterrupted={Boolean(challenge)}
            onCancel={flow.closeDeleteAccount}
            onConfirmationChange={flow.updateDeleteConfirmation}
            onDelete={flow.submitDeleteAccount}
          />
        ) : null}
      </Freeze>
      <ReverificationDialog
        challenge={challenge}
        flow={flow}
      />
    </AlertDialog>
  );
}

type ReverificationFlow = Pick<
  PasswordFlow,
  'cancelReverification' | 'resendReverification' | 'submitVerification' | 'updateVerificationValue'
>;

function ReverificationDialog({
  challenge,
  flow,
}: {
  challenge: PasswordFlow['reverification'] extends infer Wrapper
    ? Wrapper extends { state: infer State }
      ? State | null
      : never
    : never;
  flow: ReverificationFlow;
}) {
  return (
    <Dialog
      open={Boolean(challenge)}
      onOpenChange={open => {
        if (!open) {
          flow.cancelReverification();
        }
      }}
    >
      <Freeze frozen={!challenge}>
        {challenge ? (
          <ReverificationDialogView
            state={challenge}
            onCancel={flow.cancelReverification}
            onResend={() => void flow.resendReverification()}
            onSubmit={value => void flow.submitVerification(value)}
            onValueChange={flow.updateVerificationValue}
          />
        ) : null}
      </Freeze>
    </Dialog>
  );
}

function FlowDialog({
  open,
  finalFocus,
  size = 'prompt',
  onOpenChange,
  children,
}: {
  open: boolean;
  finalFocus?: React.RefObject<HTMLElement | null>;
  size?: 'prompt' | 'card';
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <Dialog.Root
      size={size}
      closedBy='closerequest'
      open={open}
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

function downloadBackupCodes(codes: string[]) {
  const url = URL.createObjectURL(new Blob([codes.join('\n')], { type: 'text/plain' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'clerk-backup-codes.txt';
  link.click();
  URL.revokeObjectURL(url);
}
