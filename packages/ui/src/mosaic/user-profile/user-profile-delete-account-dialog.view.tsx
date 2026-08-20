import * as stylex from '@stylexjs/stylex';
import { type FormEvent, type ReactNode } from 'react';

import { AlertDialog, type AlertDialogProps } from '../components/alert-dialog';
import { Button } from '../components/button';
import { Field } from '../components/field';
import { Heading } from '../components/heading';
import { Input } from '../components/input';
import { Text } from '../components/text';
import { mergeStyleProps, themeProps } from '../props';
import { deleteAccountDialogStyles as styles } from './user-profile-delete-account-dialog.styles';

const confirmationText = 'Delete account';

export interface UserProfileDeleteAccountDialogViewProps extends Pick<
  AlertDialogProps,
  'open' | 'defaultOpen' | 'onOpenChange'
> {
  confirmation: string;
  submitting?: boolean;
  /** A verification prompt rendered inside the delete-account alert's stacking context. */
  verificationDialog?: ReactNode;
  onConfirmationChange: (value: string) => void;
  onDelete: () => void;
}

export function UserProfileDeleteAccountDialogView({
  confirmation,
  submitting = false,
  verificationDialog,
  onConfirmationChange,
  onDelete,
  ...dialogProps
}: UserProfileDeleteAccountDialogViewProps) {
  const canSubmit = confirmation === confirmationText;
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (canSubmit && !submitting) {
      onDelete();
    }
  };

  return (
    <AlertDialog.Root {...dialogProps}>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop />
        <AlertDialog.Viewport>
          <AlertDialog.Popup>
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
                disabled={submitting}
                {...stylex.props(styles.field)}
              >
                <Field.Label>Type “Delete account” below to continue</Field.Label>
                <Input
                  name='deleteConfirmation'
                  autoComplete='off'
                  placeholder={confirmationText}
                  value={confirmation}
                  onChange={event => onConfirmationChange(event.target.value)}
                />
              </Field.Root>
              <AlertDialog.Actions>
                <AlertDialog.Close render={<Button variant='outline' />}>Cancel</AlertDialog.Close>
                <Button
                  type='submit'
                  color='negative'
                  disabled={!canSubmit || submitting}
                  focusableWhenDisabled
                >
                  {submitting ? 'Deleting…' : 'Delete account'}
                </Button>
              </AlertDialog.Actions>
            </form>
          </AlertDialog.Popup>
        </AlertDialog.Viewport>
      </AlertDialog.Portal>
      {verificationDialog}
    </AlertDialog.Root>
  );
}
