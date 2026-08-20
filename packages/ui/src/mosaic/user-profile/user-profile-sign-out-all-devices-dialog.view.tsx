import type { ReactNode } from 'react';

import { AlertDialog, type AlertDialogProps } from '../components/alert-dialog';
import { Button, SubmitButton } from '../components/button';
import { Heading } from '../components/heading';
import { Text } from '../components/text';
import type { UserProfileSignOutAllDevicesFlowState } from './dialogs/flow.types';

export interface UserProfileSignOutAllDevicesDialogViewProps extends Pick<
  AlertDialogProps,
  'open' | 'defaultOpen' | 'onOpenChange'
> {
  state: UserProfileSignOutAllDevicesFlowState;
  /** A verification prompt rendered inside the sign-out alert's stacking context. */
  verificationDialog?: ReactNode;
  onSignOut: () => void;
}

export function UserProfileSignOutAllDevicesDialogView({
  state,
  verificationDialog,
  onSignOut,
  ...dialogProps
}: UserProfileSignOutAllDevicesDialogViewProps) {
  const { isSubmitting, errors } = state;
  return (
    <AlertDialog {...dialogProps}>
      <AlertDialog.Title render={<Heading size='sm' />}>Sign out of all devices?</AlertDialog.Title>
      <AlertDialog.Description render={<Text />}>
        You will be signed out of all devices except this one.
      </AlertDialog.Description>
      {errors.form ? (
        <Text
          color='negative'
          role='alert'
        >
          {errors.form}
        </Text>
      ) : null}
      <AlertDialog.Actions>
        <AlertDialog.Close render={<Button variant='outline' />}>Cancel</AlertDialog.Close>
        <SubmitButton
          type='button'
          color='negative'
          isPending={isSubmitting}
          pendingLabel='Signing out of all devices'
          onClick={onSignOut}
        >
          Sign out of all devices
        </SubmitButton>
      </AlertDialog.Actions>
      {verificationDialog}
    </AlertDialog>
  );
}
