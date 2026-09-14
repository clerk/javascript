import { Button } from '../components/button';
import type { DialogFocusTarget } from '../components/dialog';
import { Dialog } from '../components/dialog';
import { Heading } from '../components/heading';
import { Text } from '../components/text';
import { userProfileWeb3WalletsMessages as m } from './user-profile-web3-wallets.messages';

export interface UserProfileRemoveWeb3WalletDialogProps {
  provider: string;
  address?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  finalFocus?: DialogFocusTarget;
}

export function UserProfileRemoveWeb3WalletDialog({
  provider,
  address,
  open,
  onOpenChange,
  onConfirm,
  finalFocus,
}: UserProfileRemoveWeb3WalletDialogProps) {
  return (
    <Dialog.Root
      role='alertdialog'
      open={open}
      onOpenChange={onOpenChange}
    >
      <Dialog.Popup finalFocus={finalFocus}>
        <Dialog.Title render={<Heading size='sm' />}>{m.removeDialog.title}</Dialog.Title>
        <Dialog.Description render={<Text />}>
          {m.removeDialog.description.replace('{wallet}', address ? `${provider} (${address})` : provider)}
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
