import * as stylex from '@stylexjs/stylex';

import { AlertDialog } from '../components/alert-dialog';
import { Button, SubmitButton } from '../components/button';
import { Dialog } from '../components/dialog';
import { Field } from '../components/field';
import { Heading } from '../components/heading';
import { Input } from '../components/input';
import { Text } from '../components/text';
import type {
  UserProfilePasskeyRemoveFlowActions,
  UserProfilePasskeyRemoveFlowState,
  UserProfilePasskeyRenameFlowActions,
  UserProfilePasskeyRenameFlowState,
} from './dialogs/flow.types';
import { DialogBody, DialogFooter, DialogForm, DialogHeader, FormAlert } from './dialogs/flow-dialog-chrome';
import { passkeyDialogStyles as styles } from './user-profile-passkey-dialog.styles';
import { fill, userProfileSecurityBase as m } from './user-profile-security.messages';

interface PasskeyDialogProps {
  isInterrupted?: boolean;
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
      <Dialog.CloseButton disabled={state.isSubmitting} />
      <DialogHeader
        title={m.passkeys.renameTitle}
        description={m.passkeys.renameDescription}
      />
      <DialogForm onSubmit={submit}>
        <DialogBody>
          <Field.Root
            required
            disabled={state.isSubmitting}
            invalid={Boolean(state.errors.field)}
            {...stylex.props(styles.field)}
          >
            <Field.Label>{m.passkeys.name}</Field.Label>
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
            disabled={state.isSubmitting}
            variant='outline'
            {...stylex.props(styles.footerButton)}
            onClick={onCancel}
          >
            {m.common.cancel}
          </Button>
          <SubmitButton
            disabled={!canSubmit}
            isPending={state.isSubmitting}
            pendingLabel={m.passkeys.renamePending}
            {...stylex.props(styles.footerButton)}
          >
            {m.common.save}
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
      <AlertDialog.Title render={<Heading size='sm' />}>{m.passkeys.removeTitle}</AlertDialog.Title>
      <AlertDialog.Description render={<Text />}>
        {fill(m.passkeys.removeDescription, { name: state.name })}
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
          disabled={state.isSubmitting}
          variant='outline'
          onClick={onCancel}
        >
          {m.common.cancel}
        </Button>
        <SubmitButton
          color='negative'
          isPending={state.isSubmitting}
          pendingLabel={m.passkeys.removePending}
          type='button'
          onClick={onRemove}
        >
          {m.common.remove}
        </SubmitButton>
      </AlertDialog.Actions>
    </div>
  );
}
