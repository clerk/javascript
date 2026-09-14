import { Button } from '../components/button';
import type { DialogFocusTarget } from '../components/dialog';
import { Dialog } from '../components/dialog';
import { Heading } from '../components/heading';
import { Text } from '../components/text';
import { userProfileConnectedAccountsMessages as m } from './user-profile-connected-accounts.messages';

export interface UserProfileRemoveConnectedAccountDialogProps {
  provider: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  finalFocus?: DialogFocusTarget;
}

export function UserProfileRemoveConnectedAccountDialog({
  provider,
  open,
  onOpenChange,
  onConfirm,
  finalFocus,
}: UserProfileRemoveConnectedAccountDialogProps) {
  return (
    <Dialog.Root
      role='alertdialog'
      open={open}
      onOpenChange={onOpenChange}
    >
      <Dialog.Popup finalFocus={finalFocus}>
        <Dialog.Title render={<Heading size='sm' />}>{m.removeDialog.title}</Dialog.Title>
        <Dialog.Description render={<Text />}>
          {m.removeDialog.description.replace('{provider}', provider)}
        </Dialog.Description>
        <Dialog.Actions>
          <Dialog.Close render={<Button variant='outline' />}>{m.removeDialog.cancel}</Dialog.Close>
          <Button
            color='negative'
            onClick={onConfirm}
          >
            {m.removeDialog.confirm}
          </Button>
        </Dialog.Actions>
      </Dialog.Popup>
    </Dialog.Root>
  );
}
