import * as stylex from '@stylexjs/stylex';
import { type FormEvent } from 'react';

import { AlertDialog } from '../components/alert-dialog';
import { Button, SubmitButton } from '../components/button';
import { Field } from '../components/field';
import { Heading } from '../components/heading';
import { Input } from '../components/input';
import { Text } from '../components/text';
import { mergeStyleProps, themeProps } from '../props';
import type { UserProfileDeleteAccountFlowState } from './dialogs/flow.types';
import { deleteAccountDialogStyles as styles } from './user-profile-delete-account-dialog.styles';

const confirmationText = 'Delete account';

export interface UserProfileDeleteAccountDialogViewProps {
  state: UserProfileDeleteAccountFlowState;
  isInterrupted?: boolean;
  onCancel: () => void;
  onConfirmationChange: (value: string) => void;
  onDelete: () => void;
}

export function UserProfileDeleteAccountDialogView({
  state,
  isInterrupted = false,
  onCancel,
  onConfirmationChange,
  onDelete,
}: UserProfileDeleteAccountDialogViewProps) {
  const { confirmation, isSubmitting, errors } = state;
  const canSubmit = confirmation === confirmationText;
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (canSubmit && !isSubmitting) {
      onDelete();
    }
  };

  return (
    <div aria-hidden={isInterrupted || undefined}>
      <AlertDialog.Title render={<Heading size='base' />}>Delete account</AlertDialog.Title>
      <AlertDialog.Description render={<Text />}>
        Are you sure you want to delete your account? Some associated data may be retained. To request full data
        deletion, please contact support.
      </AlertDialog.Description>
      <form
        onSubmit={submit}
        {...mergeStyleProps(themeProps('user-profile-delete-account-dialog-form'), stylex.props(styles.form))}
      >
        <Field.Root
          required
          disabled={isSubmitting}
          {...stylex.props(styles.field)}
        >
          <Field.Label>Type “Delete account” below to continue</Field.Label>
          <Input
            name='deleteConfirmation'
            autoComplete='off'
            spellCheck={false}
            placeholder={confirmationText}
            value={confirmation}
            onChange={event => onConfirmationChange(event.target.value)}
          />
        </Field.Root>
        {errors.form ? (
          <Text
            color='negative'
            role='alert'
          >
            {errors.form}
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
            disabled={!canSubmit}
            isPending={isSubmitting}
            pendingLabel='Deleting account'
          >
            Delete account
          </SubmitButton>
        </AlertDialog.Actions>
      </form>
    </div>
  );
}
