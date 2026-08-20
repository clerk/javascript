import * as stylex from '@stylexjs/stylex';
import type { FormEvent, ReactNode } from 'react';

import { AlertDialog } from '../components/alert-dialog';
import { Button, SubmitButton } from '../components/button';
import { Card } from '../components/card';
import { Dialog, type DialogProps } from '../components/dialog';
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

interface PasskeyDialogProps extends Pick<DialogProps, 'open' | 'defaultOpen' | 'onOpenChange'> {
  verificationDialog?: ReactNode;
}

export interface UserProfilePasskeyAddDialogViewProps extends PasskeyDialogProps {
  state: UserProfilePasskeyAddFlowState;
  onAdd: () => void;
}

export function UserProfilePasskeyAddDialogView({
  state,
  verificationDialog,
  onAdd,
  ...dialogProps
}: UserProfilePasskeyAddDialogViewProps) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!state.isSubmitting) {
      onAdd();
    }
  };

  return (
    <Dialog.Root
      size='card'
      closedBy='closerequest'
      {...dialogProps}
    >
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Viewport>
          <Dialog.Popup
            render={
              <Card.Root
                elevation='overlay'
                renderBranding={false}
              />
            }
          >
            <Dialog.CloseButton />
            <form
              onSubmit={submit}
              {...stylex.props(styles.form)}
            >
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
                <Dialog.Close
                  render={props => (
                    <Button
                      {...props}
                      {...stylex.props(styles.footerButton)}
                      variant='outline'
                    >
                      Cancel
                    </Button>
                  )}
                />
                <SubmitButton
                  isPending={state.isSubmitting}
                  pendingLabel='Adding passkey'
                  {...stylex.props(styles.footerButton)}
                >
                  Add passkey
                </SubmitButton>
              </Card.Footer>
            </form>
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
      {verificationDialog}
    </Dialog.Root>
  );
}

export interface UserProfilePasskeyRenameDialogViewProps extends PasskeyDialogProps {
  state: UserProfilePasskeyRenameFlowState;
  onNameChange: (name: string) => void;
  onRename: () => void;
}

export function UserProfilePasskeyRenameDialogView({
  state,
  verificationDialog,
  onNameChange,
  onRename,
  ...dialogProps
}: UserProfilePasskeyRenameDialogViewProps) {
  const canSubmit = state.name.length > 1 && state.name !== state.originalName;
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (canSubmit && !state.isSubmitting) {
      onRename();
    }
  };

  return (
    <Dialog.Root
      size='card'
      closedBy='closerequest'
      {...dialogProps}
    >
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Viewport>
          <Dialog.Popup
            render={
              <Card.Root
                elevation='overlay'
                renderBranding={false}
              />
            }
          >
            <Dialog.CloseButton />
            <form
              onSubmit={submit}
              {...stylex.props(styles.form)}
            >
              <Card.Header>
                <Dialog.Title render={<Heading size='sm' />}>Rename passkey</Dialog.Title>
                <Dialog.Description render={<Text />}>
                  Change the passkey name to make it easier to find.
                </Dialog.Description>
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
                <Dialog.Close
                  render={props => (
                    <Button
                      {...props}
                      {...stylex.props(styles.footerButton)}
                      variant='outline'
                    >
                      Cancel
                    </Button>
                  )}
                />
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
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
      {verificationDialog}
    </Dialog.Root>
  );
}

export interface UserProfilePasskeyRemoveDialogViewProps {
  open?: boolean;
  state: UserProfilePasskeyRemoveFlowState;
  verificationDialog?: ReactNode;
  onOpenChange?: (open: boolean) => void;
  onRemove: () => void;
}

export function UserProfilePasskeyRemoveDialogView({
  state,
  verificationDialog,
  onRemove,
  ...dialogProps
}: UserProfilePasskeyRemoveDialogViewProps) {
  return (
    <AlertDialog.Root {...dialogProps}>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop />
        <AlertDialog.Viewport>
          <AlertDialog.Popup>
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
              <AlertDialog.Close render={<Button variant='outline' />}>Cancel</AlertDialog.Close>
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
          </AlertDialog.Popup>
        </AlertDialog.Viewport>
      </AlertDialog.Portal>
      {verificationDialog}
    </AlertDialog.Root>
  );
}
