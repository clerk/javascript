import { AlertDialog } from '../components/alert-dialog';
import { Button, SubmitButton } from '../components/button';
import { Heading } from '../components/heading';
import { Text } from '../components/text';
import type { UserProfileSignOutAllDevicesFlowState } from './dialogs/flow.types';

export interface UserProfileSignOutAllDevicesDialogViewProps {
  state: UserProfileSignOutAllDevicesFlowState;
  isInterrupted?: boolean;
  onCancel: () => void;
  onSignOut: () => void;
}

export function UserProfileSignOutAllDevicesDialogView({
  state,
  isInterrupted = false,
  onCancel,
  onSignOut,
}: UserProfileSignOutAllDevicesDialogViewProps) {
  const { isSubmitting, errors } = state;
  return (
    <div aria-hidden={isInterrupted || undefined}>
      <AlertDialog.Title render={<Heading size='sm' />}>Sign out of all other devices?</AlertDialog.Title>
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
        <Button
          type='button'
          variant='outline'
          onClick={onCancel}
        >
          Cancel
        </Button>
        <SubmitButton
          type='button'
          color='negative'
          isPending={isSubmitting}
          pendingLabel='Signing out of all other devices'
          onClick={onSignOut}
        >
          Sign out of all other devices
        </SubmitButton>
      </AlertDialog.Actions>
    </div>
  );
}
