import * as stylex from '@stylexjs/stylex';
import type { FormEvent } from 'react';

import { AlertDialog } from '../components/alert-dialog';
import { Button, SubmitButton } from '../components/button';
import { Card } from '../components/card';
import { Dialog } from '../components/dialog';
import { Field } from '../components/field';
import { Heading } from '../components/heading';
import { Input } from '../components/input';
import { Text } from '../components/text';
import type {
  UserProfilePasskeyAddFlowState,
  UserProfilePasskeyRemoveFlowState,
  UserProfilePasskeyRenameFlowState,
} from './dialogs/flow.types';
import { passkeyDialogStyles as styles } from './user-profile-passkey-dialog.styles';

interface PasskeyDialogProps {
  isInterrupted?: boolean;
  onCancel: () => void;
}

export interface UserProfilePasskeyAddDialogViewProps extends PasskeyDialogProps {
  state: UserProfilePasskeyAddFlowState;
  onAdd: () => void;
}

export function UserProfilePasskeyAddDialogView({
  state,
  isInterrupted = false,
  onCancel,
  onAdd,
}: UserProfilePasskeyAddDialogViewProps) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!state.isSubmitting) {
      onAdd();
    }
  };

  return (
    <form
      aria-hidden={isInterrupted || undefined}
      onSubmit={submit}
      {...stylex.props(styles.form)}
    >
      <Dialog.CloseButton />
      <Card.Header>
        <Dialog.Title render={<Heading size='sm' />}>Add passkey</Dialog.Title>
        <Dialog.Description render={<Text />}>
          Your browser or device will ask you to create a passkey for this account.
        </Dialog.Description>
      </Card.Header>
      {state.errors.form ? (
        <Card.Content>
          <Text
            color='negative'
            role='alert'
          >
            {state.errors.form}
          </Text>
        </Card.Content>
      ) : null}
      <Card.Footer>
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
      </Card.Footer>
    </form>
  );
}

export interface UserProfilePasskeyRenameDialogViewProps extends PasskeyDialogProps {
  state: UserProfilePasskeyRenameFlowState;
  onNameChange: (name: string) => void;
  onRename: () => void;
}

export function UserProfilePasskeyRenameDialogView({
  state,
  isInterrupted = false,
  onCancel,
  onNameChange,
  onRename,
}: UserProfilePasskeyRenameDialogViewProps) {
  const canSubmit = state.name.length > 1 && state.name !== state.originalName;
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (canSubmit && !state.isSubmitting) {
      onRename();
    }
  };

  return (
    <form
      aria-hidden={isInterrupted || undefined}
      onSubmit={submit}
      {...stylex.props(styles.form)}
    >
      <Dialog.CloseButton />
      <Card.Header>
        <Dialog.Title render={<Heading size='sm' />}>Rename passkey</Dialog.Title>
        <Dialog.Description render={<Text />}>Change the passkey name to make it easier to find.</Dialog.Description>
      </Card.Header>
      <Card.Content>
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
        {state.errors.form ? (
          <Text
            color='negative'
            role='alert'
          >
            {state.errors.form}
          </Text>
        ) : null}
      </Card.Content>
      <Card.Footer>
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
      </Card.Footer>
    </form>
  );
}

export interface UserProfilePasskeyRemoveDialogViewProps {
  state: UserProfilePasskeyRemoveFlowState;
  isInterrupted?: boolean;
  onCancel: () => void;
  onRemove: () => void;
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
