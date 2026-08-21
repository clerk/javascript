import * as stylex from '@stylexjs/stylex';
import { type FormEvent } from 'react';

import { AlertDialog } from '../components/alert-dialog';
import { Button, SubmitButton } from '../components/button';
import { Field } from '../components/field';
import { Heading } from '../components/heading';
import { Input } from '../components/input';
import { Text } from '../components/text';
import { mergeStyleProps, themeProps } from '../props';
import type { UserProfileDeleteAccountFlowActions, UserProfileDeleteAccountFlowState } from './dialogs/flow.types';
import { deleteAccountDialogStyles as styles } from './user-profile-delete-account-dialog.styles';
import { userProfileSecurityBase as m } from './user-profile-security.messages';

const confirmationText = m.deleteAccount.title;

export interface UserProfileDeleteAccountDialogViewProps extends UserProfileDeleteAccountFlowActions {
  state: UserProfileDeleteAccountFlowState;
  isInterrupted?: boolean;
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
      <AlertDialog.Title render={<Heading size='base' />}>{m.deleteAccount.title}</AlertDialog.Title>
      <AlertDialog.Description render={<Text />}>{m.deleteAccount.description}</AlertDialog.Description>
      <form
        onSubmit={submit}
        {...mergeStyleProps(themeProps('user-profile-delete-account-dialog-form'), stylex.props(styles.form))}
      >
        <Field.Root
          required
          disabled={isSubmitting}
          {...stylex.props(styles.field)}
        >
          <Field.Label>{m.deleteAccount.confirmationLabel}</Field.Label>
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
            disabled={isSubmitting}
            variant='outline'
            onClick={onCancel}
          >
            {m.common.cancel}
          </Button>
          <SubmitButton
            color='negative'
            disabled={!canSubmit}
            isPending={isSubmitting}
            pendingLabel={m.deleteAccount.pending}
          >
            {m.deleteAccount.title}
          </SubmitButton>
        </AlertDialog.Actions>
      </form>
    </div>
  );
}
