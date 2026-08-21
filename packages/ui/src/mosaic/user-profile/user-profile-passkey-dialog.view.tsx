import * as stylex from '@stylexjs/stylex';

import { AlertDialog } from '../components/alert-dialog';
import { Button, SubmitButton } from '../components/button';
import { Dialog } from '../components/dialog';
import { Field } from '../components/field';
import { Heading } from '../components/heading';
import { Input } from '../components/input';
import { Text } from '../components/text';
import type {
  UserProfilePasskeyAddFlowActions,
  UserProfilePasskeyAddFlowState,
  UserProfilePasskeyRemoveFlowActions,
  UserProfilePasskeyRemoveFlowState,
  UserProfilePasskeyRenameFlowActions,
  UserProfilePasskeyRenameFlowState,
} from './dialogs/flow.types';
import { DialogBody, DialogFooter, DialogForm, DialogHeader, FormAlert } from './dialogs/flow-dialog-chrome';
import { passkeyDialogStyles as styles } from './user-profile-passkey-dialog.styles';

interface PasskeyDialogProps {
  isInterrupted?: boolean;
}

export interface UserProfilePasskeyAddDialogViewProps extends PasskeyDialogProps, UserProfilePasskeyAddFlowActions {
  state: UserProfilePasskeyAddFlowState;
}

export function UserProfilePasskeyAddDialogView({
  state,
  isInterrupted = false,
  onCancel,
  onAdd,
}: UserProfilePasskeyAddDialogViewProps) {
  const submit = () => {
    if (!state.isSubmitting) {
      onAdd();
    }
  };

  return (
    <div aria-hidden={isInterrupted || undefined}>
      <Dialog.CloseButton />
      <DialogHeader
        title='Add passkey'
        description='Your browser or device will ask you to create a passkey for this account.'
      />
      <DialogForm onSubmit={submit}>
        <DialogBody>
          <FormAlert>{state.errors.form}</FormAlert>
        </DialogBody>
        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            {...stylex.props(styles.footerButton)}
            onClick={onCancel}
          >
            Cancel
          </Button>
          <SubmitButton
            isPending={state.isSubmitting}
            pendingLabel='Adding passkey'
            {...stylex.props(styles.footerButton)}
          >
            Add passkey
          </SubmitButton>
        </DialogFooter>
      </DialogForm>
    </div>
  );
}

export interface UserProfilePasskeyRenameDialogViewProps
  extends PasskeyDialogProps, UserProfilePasskeyRenameFlowActions {
  state: UserProfilePasskeyRenameFlowState;
}

export function UserProfilePasskeyRenameDialogView({
  state,
  isInterrupted = false,
  onCancel,
  onNameChange,
  onRename,
}: UserProfilePasskeyRenameDialogViewProps) {
  const canSubmit = state.name.length > 1 && state.name !== state.originalName;
  const submit = () => {
    if (canSubmit && !state.isSubmitting) {
      onRename();
    }
  };

  return (
    <div aria-hidden={isInterrupted || undefined}>
      <Dialog.CloseButton />
      <DialogHeader
        title='Rename passkey'
        description='Change the passkey name to make it easier to find.'
      />
      <DialogForm onSubmit={submit}>
        <DialogBody>
          <Field.Root
            required
            disabled={state.isSubmitting}
            invalid={Boolean(state.errors.field)}
            {...stylex.props(styles.field)}
          >
            <Field.Label>Passkey name</Field.Label>
            <Input
              autoComplete='off'
              spellCheck={false}
              value={state.name}
              onChange={event => onNameChange(event.target.value)}
            />
            {state.errors.field ? <Field.Error>{state.errors.field}</Field.Error> : null}
          </Field.Root>
          <FormAlert>{state.errors.form}</FormAlert>
        </DialogBody>
        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            {...stylex.props(styles.footerButton)}
            onClick={onCancel}
          >
            Cancel
          </Button>
          <SubmitButton
            disabled={!canSubmit}
            isPending={state.isSubmitting}
            pendingLabel='Renaming passkey'
            {...stylex.props(styles.footerButton)}
          >
            Save
          </SubmitButton>
        </DialogFooter>
      </DialogForm>
    </div>
  );
}

export interface UserProfilePasskeyRemoveDialogViewProps extends UserProfilePasskeyRemoveFlowActions {
  state: UserProfilePasskeyRemoveFlowState;
  isInterrupted?: boolean;
}

export function UserProfilePasskeyRemoveDialogView({
  state,
  isInterrupted = false,
  onCancel,
  onRemove,
}: UserProfilePasskeyRemoveDialogViewProps) {
  return (
    <div aria-hidden={isInterrupted || undefined}>
      <AlertDialog.Title render={<Heading size='sm' />}>Remove passkey</AlertDialog.Title>
      <AlertDialog.Description render={<Text />}>
        {state.name} will be removed from this account.
      </AlertDialog.Description>
      {state.errors.form ? (
        <Text
          color='negative'
          role='alert'
        >
          {state.errors.form}
        </Text>
      ) : null}
      <AlertDialog.Actions>
        <Button
          type='button'
          variant='outline'
          onClick={onCancel}
        >
          Cancel
        </Button>
        <SubmitButton
          color='negative'
          isPending={state.isSubmitting}
          pendingLabel='Removing passkey'
          type='button'
          onClick={onRemove}
        >
          Remove
        </SubmitButton>
      </AlertDialog.Actions>
    </div>
  );
}
