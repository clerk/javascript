import { AlertDialog } from '../../components/alert-dialog';
import { Button, SubmitButton } from '../../components/button';
import type { ConfirmContactActionState, ContactKind } from './flow.types';
import { FormAlert, Identifier } from './flow-dialog-chrome';

export interface RemoveContactDialogViewProps {
  kind: ContactKind;
  state: ConfirmContactActionState;
  /**
   * Legacy suppresses the "you will no longer be able to sign in" line on an unverified contact,
   * because an unverified one was never usable for sign-in in the first place.
   */
  isVerified: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const REMOVE_COPY = {
  email: {
    title: 'Remove email address',
    line1: (identifier: string) => <>{identifier} will be removed from this account.</>,
    line2: 'You will no longer be able to sign in using this email address.',
    action: 'Remove',
    pending: 'Removing…',
  },
  phone: {
    title: 'Remove phone number',
    line1: (identifier: string) => <>{identifier} will be removed from this account.</>,
    line2: 'You will no longer be able to sign in using this phone number.',
    action: 'Remove',
    pending: 'Removing…',
  },
} as const;

/** Destructive confirmation for removing a contact. */
export function RemoveContactDialogView({
  kind,
  state,
  isVerified,
  onConfirm,
  onCancel,
}: RemoveContactDialogViewProps) {
  const text = REMOVE_COPY[kind];

  return (
    <>
      <AlertDialog.Title>{text.title}</AlertDialog.Title>
      <AlertDialog.Description>
        {text.line1(state.identifier)}
        {isVerified ? ` ${text.line2}` : null}
      </AlertDialog.Description>
      <FormAlert>{state.errors.form}</FormAlert>
      <AlertDialog.Actions>
        <Button
          color='neutral'
          disabled={state.isSubmitting}
          variant='outline'
          onClick={onCancel}
        >
          Cancel
        </Button>
        <SubmitButton
          color='negative'
          isPending={state.isSubmitting}
          pendingLabel='Removing'
          type='button'
          onClick={onConfirm}
        >
          {text.action}
        </SubmitButton>
      </AlertDialog.Actions>
    </>
  );
}

export interface SetPrimaryContactDialogViewProps {
  kind: ContactKind;
  state: ConfirmContactActionState;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Confirmation for promoting a contact to primary.
 *
 * Legacy fires this straight from the three-dots menu with no surface of its own, which leaves an
 * async call that can fail — it is wrapped in `useReverification` — with nowhere to report the
 * failure. A dialog gives the pending and error states somewhere to live.
 */
export function SetPrimaryContactDialogView({ kind, state, onConfirm, onCancel }: SetPrimaryContactDialogViewProps) {
  const noun = kind === 'email' ? 'email address' : 'phone number';

  return (
    <>
      <AlertDialog.Title>Set as primary {noun}</AlertDialog.Title>
      <AlertDialog.Description>
        <Identifier>{state.identifier}</Identifier> will become the primary {noun} for this account and will receive
        account notifications.
      </AlertDialog.Description>
      <FormAlert>{state.errors.form}</FormAlert>
      <AlertDialog.Actions>
        <Button
          color='neutral'
          disabled={state.isSubmitting}
          variant='outline'
          onClick={onCancel}
        >
          Cancel
        </Button>
        <SubmitButton
          isPending={state.isSubmitting}
          pendingLabel='Saving'
          type='button'
          onClick={onConfirm}
        >
          Set as primary
        </SubmitButton>
      </AlertDialog.Actions>
    </>
  );
}
