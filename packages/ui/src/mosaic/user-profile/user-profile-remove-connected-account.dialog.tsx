import { Banner } from '../components/banner';
import { Button } from '../components/button';
import { Dialog } from '../components/dialog';
import { Heading } from '../components/heading';
import { Text } from '../components/text';
import { userProfileConnectedAccountsMessages as m } from './user-profile-connected-accounts.messages';

export interface UserProfileRemoveConnectedAccountDialogProps {
  provider: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isPending?: boolean;
  errorMessage?: string;
}

export function UserProfileRemoveConnectedAccountDialog({
  provider,
  open,
  onOpenChange,
  onConfirm,
  isPending,
  errorMessage,
}: UserProfileRemoveConnectedAccountDialogProps) {
  return (
    <Dialog.Root
      role='alertdialog'
      open={open}
      onOpenChange={onOpenChange}
    >
      <Dialog.Popup>
        <Dialog.Title render={<Heading size='sm' />}>{m.removeDialog.title}</Dialog.Title>
        <Dialog.Description render={<Text />}>
          {m.removeDialog.description.replace('{provider}', provider)}
        </Dialog.Description>
        {errorMessage ? (
          <Banner.Root
            role='alert'
            color='negative'
          >
            <Banner.Label>{errorMessage}</Banner.Label>
          </Banner.Root>
        ) : null}
        <Dialog.Actions>
          <Dialog.Close render={<Button variant='outline' />}>{m.removeDialog.cancel}</Dialog.Close>
          <Button
            aria-label={m.removeDialog.confirm}
            color='negative'
            disabled={isPending}
            aria-busy={isPending || undefined}
            onClick={onConfirm}
          >
            {isPending ? m.removeDialog.pending : m.removeDialog.confirm}
          </Button>
        </Dialog.Actions>
      </Dialog.Popup>
    </Dialog.Root>
  );
}
