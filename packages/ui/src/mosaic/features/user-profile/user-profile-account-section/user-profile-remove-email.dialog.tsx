import * as stylex from '@stylexjs/stylex';

import { Button } from '../../../components/button';
import { Dialog } from '../../../components/dialog';
import { Heading } from '../../../components/heading';
import { Text } from '../../../components/text';
import { styles } from '../user-profile-profile-panel.styles';
import { userProfileAccountSectionBase as m } from './user-profile-account-section.messages';

export interface UserProfileRemoveEmailDialogProps {
  emailAddress: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function UserProfileRemoveEmailDialog({
  emailAddress,
  open,
  onOpenChange,
  onConfirm,
}: UserProfileRemoveEmailDialogProps) {
  const [beforeEmail, afterEmail] = m.email.removeDialog.description.split('{emailAddress}');

  return (
    <Dialog.Root
      role='alertdialog'
      open={open}
      onOpenChange={onOpenChange}
    >
      <Dialog.Popup>
        <Dialog.Title render={<Heading size='sm' />}>{m.email.removeDialog.title}</Dialog.Title>
        <Dialog.Description render={<Text />}>
          {beforeEmail}
          <strong {...stylex.props(styles.confirmationContactValue)}>{emailAddress}</strong>
          {afterEmail}
        </Dialog.Description>
        <Dialog.Actions>
          <Dialog.Close render={<Button variant='outline' />}>{m.email.removeDialog.cancel}</Dialog.Close>
          <Button
            color='negative'
            onClick={onConfirm}
          >
            {m.email.removeDialog.confirm}
          </Button>
        </Dialog.Actions>
      </Dialog.Popup>
    </Dialog.Root>
  );
}
