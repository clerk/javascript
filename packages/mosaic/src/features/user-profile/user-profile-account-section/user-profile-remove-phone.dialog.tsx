import * as stylex from '@stylexjs/stylex';

import { Button } from '../../../components/button';
import { Dialog } from '../../../components/dialog';
import { Heading } from '../../../components/heading';
import { Text } from '../../../components/text';
import { styles } from '../user-profile-profile-panel.styles';
import { userProfileAccountSectionBase as m } from './user-profile-account-section.messages';

export interface UserProfileRemovePhoneDialogProps {
  phoneNumber: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function UserProfileRemovePhoneDialog({
  phoneNumber,
  open,
  onOpenChange,
  onConfirm,
}: UserProfileRemovePhoneDialogProps) {
  const [beforePhone, afterPhone] = m.phone.removeDialog.description.split('{phoneNumber}');

  return (
    <Dialog.Root
      role='alertdialog'
      open={open}
      onOpenChange={onOpenChange}
    >
      <Dialog.Popup>
        <Dialog.Title render={<Heading size='sm' />}>{m.phone.removeDialog.title}</Dialog.Title>
        <Dialog.Description render={<Text />}>
          {beforePhone}
          <strong {...stylex.props(styles.confirmPhoneNumber)}>{phoneNumber}</strong>
          {afterPhone}
        </Dialog.Description>
        <Dialog.Actions>
          <Dialog.Close render={<Button variant='outline' />}>{m.phone.removeDialog.cancel}</Dialog.Close>
          <Button
            color='negative'
            onClick={onConfirm}
          >
            {m.phone.removeDialog.confirm}
          </Button>
        </Dialog.Actions>
      </Dialog.Popup>
    </Dialog.Root>
  );
}
