import { AlertDialog } from '../components/alert-dialog';
import { Button, SubmitButton } from '../components/button';
import { Heading } from '../components/heading';
import { Text } from '../components/text';
import type {
  UserProfileSignOutAllDevicesFlowActions,
  UserProfileSignOutAllDevicesFlowState,
} from './dialogs/flow.types';
import { userProfileSecurityBase as m } from './user-profile-security.messages';

export interface UserProfileSignOutAllDevicesDialogViewProps extends UserProfileSignOutAllDevicesFlowActions {
  state: UserProfileSignOutAllDevicesFlowState;
  isInterrupted?: boolean;
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
      <AlertDialog.Title render={<Heading size='sm' />}>{m.devices.bulkTitle}</AlertDialog.Title>
      <AlertDialog.Description render={<Text />}>{m.devices.bulkDescription}</AlertDialog.Description>
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
          disabled={state.isSubmitting}
          variant='outline'
          onClick={onCancel}
        >
          {m.common.cancel}
        </Button>
        <SubmitButton
          type='button'
          color='negative'
          isPending={isSubmitting}
          pendingLabel={m.devices.bulkPending}
          onClick={onSignOut}
        >
          {m.devices.signOutAllOthers}
        </SubmitButton>
      </AlertDialog.Actions>
    </div>
  );
}
