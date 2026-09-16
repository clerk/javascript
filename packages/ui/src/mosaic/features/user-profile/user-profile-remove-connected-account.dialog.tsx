import { Banner } from '../../components/banner';
import { Button, SubmitButton } from '../../components/button';
import { Dialog } from '../../components/dialog';
import { Heading } from '../../components/heading';
import { Text } from '../../components/text';
import { fill } from '../../utils/messages';
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
          {fill(m.removeDialog.description, { provider: provider })}
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
          <Dialog.Close
            disabled={isPending}
            render={<Button variant='outline' />}
          >
            {m.removeDialog.cancel}
          </Dialog.Close>
          <SubmitButton
            type='button'
            color='negative'
            isPending={isPending}
            pendingLabel={m.removeDialog.pending}
            onClick={onConfirm}
          >
            {m.removeDialog.confirm}
          </SubmitButton>
        </Dialog.Actions>
      </Dialog.Popup>
    </Dialog.Root>
  );
}
