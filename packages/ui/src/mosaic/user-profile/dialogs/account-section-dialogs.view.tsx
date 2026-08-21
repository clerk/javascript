import type { DialogOpenChangeDetails } from '@clerk/headless/dialog';
import { Freeze } from '@clerk/headless/utils';
import React from 'react';

import { AlertDialog, useConfirmedClose } from '../../components/alert-dialog';
import { Dialog } from '../../components/dialog';
import { AddContactDialogView } from './add-contact-dialog.view';
import { RemoveContactDialogView, SetPrimaryContactDialogView } from './confirm-contact-dialog.view';
import { EditAvatarDialogView, EditNameDialogView, EditUsernameDialogView } from './edit-profile-dialog.view';
import type { AccountSectionFlows, EditProfileFlow } from './flow.types';
import { ReverificationDialogView } from './reverification-dialog.view';

/** A close this code issues rather than one the user gestured, for routing Cancel through a guard. */
const PROGRAMMATIC_CLOSE: DialogOpenChangeDetails = { trigger: null, triggerId: null, event: undefined };

interface FlowDialogProps {
  open: boolean;
  finalFocus?: React.RefObject<HTMLElement | null>;
  closedBy?: 'any' | 'closerequest' | 'none';
  onOpenChange: (open: boolean, details: DialogOpenChangeDetails) => void;
  onFocusCapture?: React.FocusEventHandler<HTMLDivElement>;
  children: React.ReactNode;
}

/**
 * A `Dialog` assembled from the compound parts, so it can take `finalFocus`.
 *
 * The `Dialog` wrapper deliberately does not forward focus props — purpose-built chrome is meant to
 * talk to `Dialog.Root` / `Dialog.Popup` directly rather than widening the generic wrapper. This is
 * that chrome, in the smallest form these flows need.
 */
function FlowDialog({ open, finalFocus, closedBy, onOpenChange, onFocusCapture, children }: FlowDialogProps) {
  return (
    <Dialog.Root
      closedBy={closedBy}
      open={open}
      onOpenChange={onOpenChange}
    >
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Viewport>
          <Dialog.Popup
            finalFocus={finalFocus}
            onFocusCapture={onFocusCapture}
          >
            {children}
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export interface AccountSectionDialogsViewProps extends AccountSectionFlows {
  /** The saved values, so a form can tell whether it has been edited. */
  name: string;
  username: string;
  /** Initials for the avatar preview when there is no image. */
  fallback: string;
}

/**
 * Every dialog the account section can open.
 *
 * Rendering them here rather than wherever the flow is driven means the composition — which dialogs
 * exist, and which surface each one is — is the view's, and the layer above supplies only a
 * snapshot and its events. A `null` flow is one that is not running: the dialog stays mounted for
 * its exit transition with its contents frozen, so it does not visibly collapse on the way out.
 */
export function AccountSectionDialogsView({
  name,
  username,
  fallback,
  flowTriggerRef,
  addContact,
  confirmContact,
  editProfile,
  reverification,
}: AccountSectionDialogsViewProps) {
  /**
   * The challenge renders INSIDE the surface it interrupts, never beside it.
   *
   * A dialog finds the stack it belongs to through React context, so two modal dialogs rendered as
   * siblings are not a stack — each marks the other's portal inert and NEITHER is left in the
   * accessibility tree. Nesting is also what gives the pair its scrim and recede treatment. This is
   * the same rule `AlertDialog.Confirm` follows.
   */
  const challenge = reverification ? (
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
  ) : null;

  // Only one flow runs at a time, so the challenge has exactly one host.
  const host = addContact ? 'add' : editProfile ? 'edit' : confirmContact ? 'confirm' : null;

  return (
    <>
      <FlowDialog
        finalFocus={flowTriggerRef}
        open={Boolean(addContact)}
        onOpenChange={open => {
          if (!open) {
            addContact?.onCancel();
          }
        }}
      >
        <Freeze frozen={!addContact}>
          {addContact ? (
            <AddContactDialogView
              isInterrupted={Boolean(reverification)}
              kind={addContact.kind}
              state={addContact.state}
              onCancel={addContact.onCancel}
              onCodeChange={addContact.onCodeChange}
              onOpenSsoPopup={addContact.onOpenSsoPopup}
              onResend={addContact.onResend}
              onSubmitCode={addContact.onSubmitCode}
              onSubmitIdentifier={addContact.onSubmitIdentifier}
              onValueChange={addContact.onValueChange}
            />
          ) : null}
        </Freeze>
        {host === 'add' ? challenge : null}
      </FlowDialog>

      <EditProfileDialog
        challenge={host === 'edit' ? challenge : null}
        editProfile={editProfile}
        fallback={fallback}
        flowTriggerRef={flowTriggerRef}
        isInterrupted={Boolean(reverification)}
        name={name}
        username={username}
      />

      <AlertDialog
        finalFocus={flowTriggerRef}
        open={Boolean(confirmContact)}
        onOpenChange={open => {
          if (!open) {
            confirmContact?.onCancel();
          }
        }}
      >
        <Freeze frozen={!confirmContact}>
          {confirmContact ? (
            confirmContact.action === 'remove' ? (
              <RemoveContactDialogView
                isVerified={confirmContact.isVerified}
                kind={confirmContact.kind}
                state={confirmContact.state}
                onCancel={confirmContact.onCancel}
                onConfirm={confirmContact.onConfirm}
              />
            ) : (
              <SetPrimaryContactDialogView
                kind={confirmContact.kind}
                state={confirmContact.state}
                onCancel={confirmContact.onCancel}
                onConfirm={confirmContact.onConfirm}
              />
            )
          ) : null}
        </Freeze>
        {host === 'confirm' ? challenge : null}
      </AlertDialog>
    </>
  );
}

/** Whether the open form differs from what is saved, which is what the discard guard asks about. */
function isDirty(editProfile: EditProfileFlow | null | undefined, name: string, username: string): boolean {
  if (!editProfile) {
    return false;
  }
  if (editProfile.field === 'name') {
    const [firstName = '', ...rest] = name.split(/\s+/);
    return editProfile.state.firstName !== firstName || editProfile.state.lastName !== rest.join(' ');
  }
  if (editProfile.field === 'username') {
    return editProfile.state.value !== username;
  }
  return Boolean(editProfile.state.fileName);
}

/**
 * The three profile-field forms share one dialog, so one discard guard covers them.
 *
 * The guard is the view's rather than the layer above's: "does closing this need confirming" is
 * answered by comparing what is on screen against what is saved, and the view has both.
 */
function EditProfileDialog({
  challenge,
  editProfile,
  name,
  username,
  fallback,
  flowTriggerRef,
  isInterrupted,
}: {
  challenge: React.ReactNode;
  editProfile: EditProfileFlow | null | undefined;
  name: string;
  username: string;
  fallback: string;
  flowTriggerRef?: React.RefObject<HTMLElement | null>;
  isInterrupted: boolean;
}) {
  // One handle per mounted dialog, not module scope: two of these sharing single-flight state
  // would let one dialog's question answer the other's.
  const discardConfirm = React.useMemo(() => AlertDialog.createConfirmHandle(), []);

  /**
   * The control that had focus when the discard question was raised, so "Keep editing" puts the
   * caret back where it was rather than on the dialog itself.
   *
   * Recorded as focus moves rather than read at close time: the primitive's focus machinery runs
   * synchronously on the close request, so by then the answer would already be wrong.
   */
  const lastFocus = React.useRef<HTMLElement | null>(null);
  const rememberFocus = (event: React.FocusEvent<HTMLDivElement>) => {
    // React portals bubble through the React tree, so the confirmation's own buttons reach this
    // handler too. Recording those would return focus to a button that no longer exists.
    if (!event.target.closest('[role="alertdialog"]')) {
      lastFocus.current = event.target;
    }
  };

  const onOpenChange = useConfirmedClose({
    handle: discardConfirm,
    when: () => isDirty(editProfile, name, username),
    onOpenChange: open => {
      if (!open) {
        editProfile?.onCancel();
      }
    },
    confirm: {
      title: 'Discard changes?',
      description: 'Your edits will be lost.',
      actionLabel: 'Discard',
      cancelLabel: 'Keep editing',
      destructive: true,
    },
  });

  // Cancel has to go through the guard: a button wired straight to the layer above never reaches
  // the dialog, so it would skip the question silently.
  const cancel = () => onOpenChange(false, PROGRAMMATIC_CLOSE);

  return (
    <FlowDialog
      closedBy='closerequest'
      finalFocus={flowTriggerRef}
      open={Boolean(editProfile)}
      onFocusCapture={rememberFocus}
      onOpenChange={onOpenChange}
    >
      <Freeze frozen={!editProfile}>
        {editProfile?.field === 'name' ? (
          <EditNameDialogView
            isInterrupted={isInterrupted}
            state={editProfile.state}
            onCancel={cancel}
            onFirstNameChange={value => editProfile.onNameChange('firstName', value)}
            onLastNameChange={value => editProfile.onNameChange('lastName', value)}
            onSubmit={editProfile.onSubmit}
          />
        ) : null}
        {editProfile?.field === 'username' ? (
          <EditUsernameDialogView
            isInterrupted={isInterrupted}
            state={editProfile.state}
            onCancel={cancel}
            onSubmit={editProfile.onSubmit}
            onValueChange={editProfile.onUsernameChange}
          />
        ) : null}
        {editProfile?.field === 'avatar' ? (
          <EditAvatarDialogView
            fallback={fallback}
            isInterrupted={isInterrupted}
            state={editProfile.state}
            onCancel={cancel}
            onRemove={editProfile.onRemoveAvatar}
            onSelectFile={editProfile.onSelectAvatarFile}
            onSubmit={editProfile.onSubmit}
          />
        ) : null}
      </Freeze>
      {/* Belongs INSIDE the dialog it guards, so the two share a floating tree, escape ordering,
          the stacking treatment and the refcounted scroll lock. */}
      {challenge}
      <AlertDialog.Confirm
        finalFocus={lastFocus}
        handle={discardConfirm}
      />
    </FlowDialog>
  );
}
