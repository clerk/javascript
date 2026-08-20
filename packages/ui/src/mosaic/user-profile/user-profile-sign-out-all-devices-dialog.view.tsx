import { AlertDialog, type AlertDialogProps } from '../components/alert-dialog';
import { Button } from '../components/button';
import { Heading } from '../components/heading';
import { Text } from '../components/text';

export interface UserProfileSignOutAllDevicesDialogViewProps extends Pick<
  AlertDialogProps,
  'open' | 'defaultOpen' | 'onOpenChange'
> {
  submitting?: boolean;
  onSignOut: () => void;
}

export function UserProfileSignOutAllDevicesDialogView({
  submitting = false,
  onSignOut,
  ...dialogProps
}: UserProfileSignOutAllDevicesDialogViewProps) {
  return (
    <AlertDialog {...dialogProps}>
      <AlertDialog.Title render={<Heading size='sm' />}>Sign out of all devices?</AlertDialog.Title>
      <AlertDialog.Description render={<Text />}>
        You will be signed out of all devices except this one.
      </AlertDialog.Description>
      <AlertDialog.Actions>
        <AlertDialog.Close render={<Button variant='outline' />}>Cancel</AlertDialog.Close>
        <Button
          color='negative'
          disabled={submitting}
          focusableWhenDisabled
          onClick={onSignOut}
        >
          {submitting ? 'Signing out…' : 'Sign out of all devices'}
        </Button>
      </AlertDialog.Actions>
    </AlertDialog>
  );
}
