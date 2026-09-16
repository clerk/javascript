import { Banner } from '../../components/banner';
import { Button, SubmitButton } from '../../components/button';
import { Dialog } from '../../components/dialog';
import { Heading } from '../../components/heading';
import { Text } from '../../components/text';
import { fill } from '../../utils/messages';
import { userProfileWeb3WalletsMessages as m } from './user-profile-web3-wallets.messages';

export interface UserProfileRemoveWeb3WalletDialogProps {
  address: string;
  isVerified: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending?: boolean;
  errorMessage?: string;
}

export function UserProfileRemoveWeb3WalletDialog({
  address,
  isVerified,
  open,
  onOpenChange,
  onConfirm,
  isPending,
  errorMessage,
}: UserProfileRemoveWeb3WalletDialogProps) {
  return (
    <Dialog.Root
      role='alertdialog'
      open={open}
      onOpenChange={onOpenChange}
    >
      <Dialog.Popup>
        <Dialog.Title render={<Heading size='sm' />}>{m.removeDialog.title}</Dialog.Title>
        <Dialog.Description render={<Text />}>
          {fill(m.removeDialog.description, { wallet: address })}
        </Dialog.Description>
        {isVerified ? <Text>{m.removeDialog.signInWarning}</Text> : null}
        {errorMessage ? (
          <Banner.Root
            role='alert'
            color='negative'
          >
            <Banner.Label>{errorMessage}</Banner.Label>
          </Banner.Root>
        ) : null}
        <Dialog.Actions>
          <Dialog.Close
            disabled={isPending}
            render={<Button variant='outline' />}
          >
            {m.removeDialog.cancel}
          </Dialog.Close>
          <SubmitButton
            type='button'
            isPending={isPending}
            pendingLabel={m.removeDialog.pending}
            color='negative'
            onClick={onConfirm}
          >
            {m.removeDialog.confirm}
          </SubmitButton>
        </Dialog.Actions>
      </Dialog.Popup>
    </Dialog.Root>
  );
}
